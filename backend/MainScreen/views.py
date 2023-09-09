import datetime
import decimal
import json
from django.forms import model_to_dict

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .serializers import DuesSerializer, EditMemberSerializer, NewFamilySerializer, NewMemberSerializer
from django.core.exceptions import ObjectDoesNotExist

from django.shortcuts import render, redirect, get_object_or_404
from django.utils import timezone
from django_q.tasks import async_task

from vouchers.models import Vouchers
from .forms import NewDue, NewMember, NewFamily, EditMember, EditDues
from MainScreen.models import Member, Due, Receipt, Ledger, Sitewide, Account, AccountTransactionRecord, \
    ReceiptsInvoice, AccountRecord, MemberFamilyChange

from django.contrib.auth.decorators import login_required
import random
import csv

from django.http import HttpResponse

import MainScreen.writefuncs as wf


# from .receipts_jobs import filter_receiptinvoices_by_family
from .worker import year_closure, year_open


def addDMfine(request):
    Due.objects.create(
        due_display_id=get_financial_year() + '/FINE',
        due_type='Fine', due_amount=0,
        due_fineamt=0, due_financial_year=get_financial_year(),
        is_head=-1, is_pension=-1, is_nri=-1,
        is_govt=-1,
        is_male=-1, due_active=1, account_serial='AC-1',
        applied=0,
        paid_together=0)
    return Response('DONE')



def get_financial_year():
    financial_year = Sitewide.objects.latest('financial_id')
    return financial_year.financial_term_code


def getdata(dt_type, value, request):
    context = {}
    context = {"header": ['JP No.', 'Member Name', 'Family No.', 'Outstanding Balance']}

    # Member Search
    if dt_type == "members":
        flag = ''
        try:
            value = decimal.Decimal(value)
        except Exception:
            flag = 'string'
        # Member Search With Decimal
        if flag != 'string':
            try:
                result = Member.objects.get(jp_number=value, is_active=True)
                context["rows"] = [[result.jp_number.normalize(), result.name, result.family_number,
                                    format(get_member_dues_balance(value), ".2f")]]
                return (context)
            except:
                pass

        # Member Search With Text
        else:
            result = Member.objects.filter(name__istartswith=value.lower(), is_active=True).order_by("name")
            context["rows"] = (
                [[member.jp_number.normalize(), member.name, member.family_number,
                  format(get_member_dues_balance(member.jp_number), ".2f")] for member in result])
            return (context)


    # Family Search
    elif dt_type == "family":

        # Family Search With Decimal
        if value.isdecimal():
            context["xrows"] = {}
            context["family_data"] = {}
            col = 0
            result = Member.objects.filter(family_number=value, is_active=True).order_by("house_name")
            for member in result:
                if member.family_number in context["xrows"].keys():
                    context["xrows"][member.family_number].append(
                        [member.jp_number.normalize(), member.name, member.family_number,
                         format(get_member_dues_balance(member.jp_number), ".2f")])
                else:
                    context["xrows"][member.family_number] = [[]]
                    context["xrows"][member.family_number][0] = (
                        member.jp_number.normalize(), member.name, member.family_number,
                        format(get_member_dues_balance(member.jp_number), ".2f"))
                if member.is_head:
                    context["family_data"][col] = [member.family_number, member.house_name, member.census_number,
                                                   member.area, member.postoffice]
                    col += 1

            return (context)

        # Family Search With Text
        else:
            i = 0
            context["xrows"] = {}
            context["family_data"] = {}
            raw_result = Member.objects.filter(house_name__istartswith=value, is_active=True).order_by("house_name")
            families = []
            for family in raw_result:
                if family.family_number not in families:
                    families.append(family.family_number)
            for family in families:
                result = Member.objects.filter(family_number=family)
                for member in result:
                    if family in context["xrows"].keys():
                        x = len(context["xrows"][family])
                        context["xrows"][family].append(
                            (member.jp_number.normalize(), member.name, member.family_number,
                             get_member_dues_balance(member.jp_number)))
                    else:
                        context["xrows"][family] = [[]]
                        context["xrows"][family][0] = (
                            member.jp_number.normalize(), member.name, str(member.family_number),
                            get_member_dues_balance(member.jp_number))
                        context["family_data"][i] = [member.family_number, member.house_name, member.census_number,
                                                     member.area, member.postoffice]
                        i += 1
            return context

    elif dt_type == "reciept":
        return redirect('/invoice/?Receipt+No.=' + value)


class HomeLoaded(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        context = {}
        context["members"] = []
        members = Member.objects.filter(is_active=True)
        for member in members:
            context["members"].append(model_to_dict(member))
        return Response(context)
    
    def post(self, request, format=None):
        context = {}
        member = request.data['MemberSearch']
        family = request.data['FamilySearch']
        receipt = request.data['ReceiptSearch']
        if member != '':
            context = getdata('members', member, request)
        elif family != '':
            context = getdata('family', family, request)
        elif receipt != '':
            context = getdata('receipt', receipt, request)
        return Response(context)


class GetDues(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        context = {}
        family = request.GET['family-dues']

        # Initializing Variables To Be Used
        context['duefamily'] = []
        context['dues'] = []
        context['familyprofile'] = family
        context["familyreceipts"] = []
        context["members"] = {}
        context['notif'] = 'No Notifications'

        result = Member.objects.filter(family_number=family)
        dues = Due.objects.filter(due_financial_year=get_financial_year())

        for member in result:
            # Fetching Family Details
            if member.is_head:
                context['duefamily'] = [member.family_number, member.house_name, member.census_number,
                                        member.area, member.postoffice]

            # Finding Head Of Family
            if member.is_head:
                context['head'] = [member.name, member.jp_number.normalize(), str(member.mobile)]

            # Fetching Dues
            for due in dues:
                txns_dues = Ledger.objects.filter(txn_member__exact=member.jp_number,
                                                  txn_due_id__exact=due.due_display_id,
                                                  txn_financial_year=get_financial_year())
                dues_total = 0
                for txn in txns_dues:
                    dues_total += txn.txn_amount
                if len(txns_dues) != 0:
                    if (dues_total == 0) and (due.due_amount == 0):
                        print('none')

                    else:
                        context["dues"].append(
                            [member.jp_number.normalize(), member.name, due.due_display_id, due.due_type,
                             due.due_amount, dues_total, member.is_active])

            # Fetching Member Details
            if member.family_number in context["members"].keys():
                context["members"][member.family_number].append(
                    [member.name, member.jp_number.normalize(), member.is_active])
            else:
                context["members"][member.family_number] = [[]]
                context["members"][member.family_number][0] = (
                    member.name, member.jp_number.normalize(), member.is_active)

            # Fetching Receipt Records
        receipt_records = ReceiptsInvoice.objects.filter(family_no=member.family_number,
                                                         receipt_financial_year=get_financial_year(),
                                                         is_active=True).order_by('-receipt_date')
        # filter_receiptinvoices_by_family(member.family_number)

        for record in receipt_records:
            names = ""
            members = []
            receipts = record.receipt_ids.split('/')
            receipts.pop(-1)
            for receipt in receipts:
                receipt_no = Receipt.objects.get(receipt_id=receipt)
                if receipt_no.receipt_member not in members:
                    try:
                        member=Member.objects.get(jp_number=receipt_no.receipt_member)
                    except:
                        member=Member.objects.filter(jp_number=receipt_no.receipt_member)[0]
                    names += member.name + ','
                    members.append(receipt_no.receipt_member)
            names = names[:-1]
            context["familyreceipts"].append(
                [record.receipt_invoice_id, record.receipt_date, record.total_amount, names])
        return Response(context)
    
    def post(self, request):
        receipt_ids = ""
        total_amount = 0

        # Parse btn and data from request
        btn = request.data.get('btn')
        data = json.loads(request.data.get('pay_list'))

        for entry in data:
            due_id = entry.get("due-id")
            member = entry.get("member-id")
            family = entry.get("family-id")
            amount_raw = entry.get("amount")

            if amount_raw == '':
                continue
            else:
                amount = decimal.Decimal(amount_raw)

            account_serial = Due.objects.get(due_display_id=due_id,
                                            due_financial_year=get_financial_year()).account_serial
            if btn == "submit-payment":
                txn_remarks = 'Normal Due Payment'
                receipt_ids += wf.due_payment_receipt_record_create(due_id, amount, member, family, account_serial,
                                                                    request.user.get_username(), txn_remarks) + '/'
                total_amount += amount

            else:
                txn_type = 'OVERRIDE'
                txn_remarks = 'Override'
                wf.ledger_record_create(due_id, txn_type, -int(amount), member, family, txn_remarks,
                                        account_serial, request.user.get_username())
        if btn == "submit-payment":
            wf.receipt_invoice_record_create(receipt_ids, total_amount, family, request.user.get_username())
        return Response({"message": "Request processed successfully"}, status=status.HTTP_200_OK)


class NewDueAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        context = {}
        existing_due_ids = []
        existing_acc_serials = {}
        due_ids = Due.objects.all()
        acc_serials = Account.objects.all()
        for due_id in due_ids:
            existing_due_ids.append(due_id.due_display_id)
        for acc_serial in acc_serials:
            existing_acc_serials[acc_serial.account_serial] = [acc_serial.account_name,acc_serial.account_number]
        context["dues"] = existing_due_ids
        context["accounts"] = existing_acc_serials
        context["financial_year"]=get_financial_year()

        return Response(context)

    def post(self, request):

            due_id = request.data.get('due_id')
            due_type = request.data.get('due_type')
            due_amount = request.data.get('due_amount')
            due_fineamt = request.data.get('due_fineamt')
            is_head = request.data.get('is_head')
            is_pension = request.data.get('is_pension')
            is_nri = request.data.get('is_nri')
            is_govt = request.data.get('is_govt')
            is_male = request.data.get('is_male')
            account_serial = request.data.get('account_serial')
            if (due_type not in ['Kudishika','Fine']) and (due_id not in ['DM-10','FINE']):
                duecreation = Due.objects.create(due_display_id=get_financial_year()+'/'+due_id, due_type=due_type, due_amount=due_amount,
                                              due_fineamt=due_fineamt, due_financial_year=get_financial_year(),
                                              is_head=is_head, is_pension=is_pension, is_nri=is_nri, is_govt=is_govt,
                                              is_male=is_male, due_active=1, account_serial=account_serial, applied=0,
                                              paid_together=0)
                return Response(status=status.HTTP_201_CREATED)
            else:
                return Response(status=status.HTTP_400_BAD_REQUEST)


class ApplyDuesAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        due_disp_id = request.data.get('due_display_id')
        due = Due.objects.get(due_display_id=due_disp_id)
        members_list = Member.objects.filter(is_active=True)
        for member in members_list:
            if (((member.is_head == due.is_head) or (due.is_head == -1))
                    and (member.is_due_apply is True)
                    and ((member.is_pension == due.is_pension) or (due.is_pension == -1))
                    and ((member.is_govt == due.is_govt) or (due.is_govt == -1))
                    and ((member.is_male == due.is_male) or (due.is_male == -1) or member.is_head == 1)
                    and ((member.is_nri == due.is_nri) or (due.is_nri == -1))
                    and (member.is_alive is True)
                    and (member.age >= 18)
                    and ((member.jp_number % 1 == 0) or member.is_head == 1)):
                txn_due_id = due.due_display_id
                txn_type = 'DUE'
                txn_amount = due.due_amount
                txn_member = member.jp_number
                txn_family = member.family_number
                txn_remarks = 'Regular Due'
                wf.ledger_record_create(txn_due_id, txn_type, txn_amount, txn_member, txn_family, txn_remarks,
                                        due.account_serial, request.user.username)
        due.applied = 1
        due.save()
        return Response(status=status.HTTP_200_OK)



class ApplyDueFineAPI(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        due_disp_id = request.data.get('due_display_id')
        user = request.user.username
        due = Due.objects.get(due_display_id=due_disp_id)
        ledger = Ledger.objects.filter(txn_financial_year=get_financial_year(), txn_due_id=due_disp_id).order_by('txn_family')
        context = {}
        for record in ledger:
            if record.txn_member in context:
                context[record.txn_member] += record.txn_amount
            else:
                context[record.txn_member] = record.txn_amount
        for member in context.keys():
                if context[member] > 0:
                    try:
                        member_details = Member.objects.get(jp_number=member)
                        wf.ledger_record_create(due_disp_id, 'DUE', due.due_fineamt, member, member_details.family_number,
                                                due.due_type + " FINE", due.account_serial, user)
                    except:
                        member_details = Member.objects.get(jp_number=member, is_active=1)
                        wf.ledger_record_create(due_disp_id, 'DUE', due.due_fineamt, member, member_details.family_number,
                                                due.due_type + " FINE", due.account_serial, user)

        due.fine_applied = 1
        due.save()
        return Response(status=status.HTTP_200_OK)
        

def get_member_dues_balance(member):
    balance_records = Ledger.objects.filter(txn_member__exact=member, txn_financial_year=get_financial_year())
    balance = 0
    for record in balance_records:
        balance += record.txn_amount
    return balance


# ACCOUNTS RELATED FUNCTIONS


class AccountsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        context = []
        accs = Account.objects.order_by('account_serial')
        accrecords = AccountRecord.objects.filter(financial_year=get_financial_year())
        print(get_financial_year())
        print(accrecords)
        for acc in accs:
            cash_in_hand = 0
            cash_in_bank = 0
            current_balance = 0
            for rec in accrecords:
                if rec.account_serial == acc.account_serial:
                    cash_in_hand += rec.add_to_cash_in_hand
                    cash_in_bank += rec.add_to_cash_in_bank
                    current_balance += rec.add_to_current_balance
            context.append(
                [acc.account_serial, acc.account_name, acc.opening_balance, cash_in_hand, cash_in_bank, current_balance,
                 accountsinfo(acc.account_serial)])
        return Response(context, status=status.HTTP_200_OK)
    
class AccountInfoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self,request):
        account_serial = request.GET['account_serial']
        print(account_serial)
        context = {}
        acc = get_object_or_404(Account,account_serial=account_serial)

        accrecords = AccountRecord.objects.filter(financial_year=get_financial_year(),account_serial=account_serial).order_by('-txn_time')

        breakdown = accountsinfo(account_serial)

        context["accountInfo"] = model_to_dict(acc)
        context["breakdown"] = {"voucher_income":breakdown[0],"voucher_expense":breakdown[1],"dues_income":breakdown[2]}
        context["txns"] =[]
        for txn in accrecords:
            context["txns"].append(model_to_dict(txn))
        return Response(context)

class AccountNamesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        context = []
        accs = Account.objects.order_by('account_serial')
        for acc in accs:
            context.append([acc.account_serial, acc.account_name])
        return Response(context, status=status.HTTP_200_OK)
    

class ManualTransactionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        context = []
        txns = AccountTransactionRecord.objects.order_by('-txn_time')
        for txn in txns:
            context.append(
                ["TXN-" + str(get_financial_year()) + " #" + str(txn.txn_id), txn.account_serial, txn.account_name,
                 txn.account_number, txn.type, txn.amount, txn.login_user, txn.txn_time])
        return Response(context, status=status.HTTP_200_OK)
    
    def post(self, request):
        if request.data['btn'] == 'deposit-withdraw':
            amount = decimal.Decimal(request.data["amount"])
            type = request.data["type"]
            account_serial = request.data["account"]
            account = Account.objects.get(account_serial=account_serial)
            AccountTransactionRecord.objects.create(account_serial=account_serial,
                                                     financial_year=get_financial_year(),
                                                     account_name=account.account_name,
                                                     account_number=account.account_number,
                                                     bank_name=account.bank_name, type=type, amount=amount,
                                                     login_user=request.user.get_username(),
                                                     txn_time=timezone.now())
            txn_id = AccountTransactionRecord.objects.all().last()

            if type == "Deposit":
                account.cash_in_hand -= amount
                account.cash_in_bank += amount
                AccountRecord.objects.create(account_serial=account_serial,
                                              financial_year=get_financial_year(),
                                              type="DEPOSIT", add_to_cash_in_hand=-amount,
                                              add_to_cash_in_bank=amount,
                                              add_to_current_balance=0, txn_time=timezone.now(),
                                              txn_ref_id=txn_id.txn_id,
                                              login_user=request.user.get_username())
            else:
                account.cash_in_hand += amount
                account.cash_in_bank -= amount
                AccountRecord.objects.create(account_serial=account_serial,
                                              financial_year=get_financial_year(),
                                              type="WITHDRAW", add_to_cash_in_hand=amount,
                                              add_to_cash_in_bank=-amount,
                                              add_to_current_balance=0, txn_time=timezone.now(),
                                              txn_ref_id=txn_id.txn_id,
                                              login_user=request.user.get_username())
            account.save()
        elif request.data['btn'] == 'transfer':
            amount = decimal.Decimal(request.data["amount"])
            to_account_serial = request.data["to_account"]
            from_account_serial = request.data["from_account"]
            from_account = Account.objects.get(account_serial=from_account_serial)
            to_account = Account.objects.get(account_serial=to_account_serial)
            AccountTransactionRecord.objects.create(account_serial=from_account_serial,
                                                     financial_year=get_financial_year(),
                                                     account_name=from_account.account_name,
                                                     account_number=from_account.account_number,
                                                     bank_name=from_account.bank_name, type="Transfer (Out)",
                                                     amount=-amount,
                                                     login_user=request.user.get_username(),
                                                     txn_time=timezone.now())
            txn_id = AccountTransactionRecord.objects.all().last()
            AccountRecord.objects.create(account_serial=from_account_serial,
                                          financial_year=get_financial_year(),
                                          type="TRANSFER (OUT)", add_to_cash_in_hand=-amount,
                                          add_to_cash_in_bank=0,
                                          add_to_current_balance=-amount, txn_time=timezone.now(),
                                          txn_ref_id=txn_id.txn_id,
                                          login_user=request.user.get_username())
            AccountTransactionRecord.objects.create(account_serial=to_account_serial,
                                                     financial_year=get_financial_year(),
                                                     account_name=to_account.account_name,
                                                     account_number=to_account.account_number,
                                                     bank_name=to_account.bank_name, type="Transfer (In)",
                                                     amount=amount,
                                                     login_user=request.user.get_username(),
                                                     txn_time=timezone.now())
            txn_id = AccountTransactionRecord.objects.all().last()
            AccountRecord.objects.create(account_serial=to_account_serial,
                                          financial_year=get_financial_year(),
                                          type="TRANSFER (IN)", add_to_cash_in_hand=amount,
                                          add_to_cash_in_bank=0,
                                          add_to_current_balance=amount, txn_time=timezone.now(),
                                          txn_ref_id=txn_id.txn_id,
                                          login_user=request.user.get_username())
        return Response(status=status.HTTP_200_OK)
    


def accountsinfo(account_serial):
    account = Account.objects.get(account_serial=account_serial)
    receipts = Receipt.objects.filter(receipt_financial_year=get_financial_year(),
                                       account_serial=account.account_serial, is_active=True)
    vouchers = Vouchers.objects.filter(voucher_financial_year=get_financial_year(),
                                       account_serial=account.account_serial)
    voucher_income = 0
    voucher_expense = 0
    receipt_income = 0
    for receipt in receipts:
        receipt_income += receipt.receipt_amount
    for voucher in vouchers:
        if voucher.voucher_type == "EXPENSE":
            voucher_expense += voucher.voucher_amount
        else:
            voucher_income += voucher.voucher_amount
    list = [format(voucher_income, '.2f'), format(voucher_expense, '.2f'), format(receipt_income, '.2f')]
    return list


class PrintInvoice(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, format=None):
        try:
            data = {}
            invoice = request.GET["receipt_no"]
            receipt_records = ReceiptsInvoice.objects.get(receipt_invoice_id=invoice)
            receipts = receipt_records.receipt_ids.split('/')[:-1]
            recs = []
            total = 0
            for receipt in receipts:
                rec = Receipt.objects.get(receipt_id=receipt)
                member = rec.receipt_member
                due_disp_id = rec.receipt_due_id
                due_rec = Due.objects.get(due_display_id=due_disp_id)
                member_rec = Member.objects.get(jp_number=member)
                recs.append([due_rec.due_type, member_rec.name, rec.receipt_amount])
                total += rec.receipt_amount
                data["invoice"] = {
                    "name": member_rec.name,
                    "jp_no": member.normalize(),
                    "receipt_no": invoice,
                    "date": rec.receipt_date,
                    "house_name": member_rec.house_name,
                    "area": member_rec.area,
                    "postoffice": member_rec.postoffice,
                    "recs": recs,
                    "total": total
                }
            return Response(data, status=status.HTTP_200_OK)
        except ReceiptsInvoice.DoesNotExist:
            raise Response(status=status.HTTP_400_BAD_REQUEST)


class NewMemberView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        serializer = NewMemberSerializer(data=request.data)

        if serializer.is_valid():
            jp = serializer.validated_data['jp_number']
            family = serializer.validated_data['family_number']
            members = Member.objects.all()
            lst = []
            for member in members:
                serial_stripped = int(member.serial[3:])
                lst.append(serial_stripped)
                if member.jp_number == jp:
                    return Response({'detail': f'Member with JP No.{jp} already exists!'}, status=status.HTTP_400_BAD_REQUEST)
            last_member = max(lst)
            try:
                family_info = Member.objects.filter(family_number=family)[0]
            except Exception:
                return Response({'detail': 'Failed! No Such Family'}, status=status.HTTP_400_BAD_REQUEST)
            serializer.save(serial='MB-' + str(last_member + 1), financial_year_serial=get_financial_year(),
                            census_number=family_info.census_number, house_name=family_info.house_name, is_active=1, is_head=0,
                            area=family_info.area, postoffice=family_info.postoffice, address=family_info.address)
            return Response({'detail': 'Done'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class NewFamilyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        serializer = NewFamilySerializer(data=request.data)

        if serializer.is_valid():
            jp = serializer.validated_data['jp_number']
            family = serializer.validated_data['family_number']
            members = Member.objects.all()
            flag = True
            old_family = ''
            lst = []
            for member in members:
                serial_stripped = int(member.serial[3:])
                lst.append(serial_stripped)
                if member.jp_number == jp:
                    member.is_active = False
                    member.save()
                    old_family = member.family_number
                if member.family_number == family:
                    flag = False
            last_member = max(lst)

            if flag:
                serializer.save(serial='MB-' + str(last_member + 1), financial_year_serial=get_financial_year(), is_active=1, is_head=1)
                x = ''
                if old_family != '':
                    x = f'Member successfully deactivated from family number {old_family} and added to {family}'

                return Response({'detail': f'Done. Member Added Successfully. {x}'}, status=status.HTTP_201_CREATED)
            else:
                return Response({'detail': f'Family with family no. {family} already exists!'}, status=status.HTTP_400_BAD_REQUEST)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EditMemberView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, jp, format=None):
        try:
            instance = Member.objects.get(jp_number=jp, is_active=1)
        except Member.DoesNotExist:
            return Response({'detail': 'Member Not Found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = EditMemberSerializer(instance)
        return Response(serializer.data)

    def put(self, request, jp, format=None):
        try:
            instance = Member.objects.get(jp_number=jp, is_active=1)
        except Member.DoesNotExist:
            return Response({'detail': 'Member Not Found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = EditMemberSerializer(instance, data=request.data)
        if serializer.is_valid():
            family = instance.family_number
            if serializer.validated_data['family_number'] != family:
                if instance.is_head:
                    return Response({'detail': f'{instance.name} is the HEAD OF FAMILY! Family Number of the head cannot be updated!'}, status=status.HTTP_400_BAD_REQUEST)
                else:
                    MemberFamilyChange.objects.create(serial=instance.serial, old_family=family,
                                                       new_family=serializer.validated_data['family_number'])
            serializer.save()

            members = Member.objects.filter(family_number=family, is_active=True)
            for member in members:
                member.house_name = serializer.validated_data['house_name']
                member.census_number = serializer.validated_data['census_number']
                member.area = serializer.validated_data['area']
                member.address = serializer.validated_data['address']
                member.postoffice = serializer.validated_data['postoffice']
                member.save()

            return Response({'detail': 'Member Updated'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DuesListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        dues = Due.objects.filter(due_financial_year=get_financial_year()).order_by('due_id')
        dues_list = []
        for due in dues:
            if due.due_type not in ['Kudishika', 'Fine']:
                dues_list.append(
                    [due.due_display_id, due.due_type, due.due_amount, due.due_fineamt, due.applied, due.paid_together,
                     due.fine_applied])
        financial_year = Sitewide.objects.latest('financial_id')
        year_closed = False if str(financial_year.year_end_date) == '1000-01-01' else True

        return Response({'dues': dues_list, 'yearclosed': year_closed})


class ManualDueApplyView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        due_display_id = request.data.get('due_display_id')
        jp = decimal.Decimal(request.data.get('member_no'))
        due = Due.objects.get(due_financial_year=get_financial_year(), due_display_id=due_display_id)
        member = Member.objects.get(jp_number= jp, is_active=1)

        txn_id = int(timezone.now().strftime("%Y%m%d%H%M%S")) + random.randrange(20000000)
        txn_due_id = due.due_display_id
        txn_type = 'DUE'
        txn_amount = due.due_amount
        txn_member = member.jp_number
        txn_family = member.family_number
        txn_remarks = 'Regular Due'
        wf.ledger_record_create(txn_due_id, txn_type, txn_amount, txn_member, txn_family, txn_remarks, due.account_serial,
                                request.user.username)

        return Response({'detail': 'Done'}, status=status.HTTP_201_CREATED)


class EditDuesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        print(request)
        due_display_id = request.GET['due_display_id']
        print("Received :", due_display_id)
        instance = get_object_or_404(Due,due_display_id=due_display_id)
        context = {}
        existing_due_ids = []
        existing_acc_serials = {}
        due_ids = Due.objects.all()
        acc_serials = Account.objects.all()
        for due_id in due_ids:
            existing_due_ids.append(due_id.due_display_id)
        for acc_serial in acc_serials:
            existing_acc_serials[acc_serial.account_serial] = [acc_serial.account_name,acc_serial.account_number]
        context["dues"] = existing_due_ids
        context["accounts"] = existing_acc_serials
        context["financial_year"]=get_financial_year()
        context["instance"] = model_to_dict(instance)
        return Response(context)

    def put(self, request, format=None):
        due_display_id = request.data.get('due_display_id')
        instance = Due.objects.get(due_display_id=due_display_id, due_active=1, due_financial_year=get_financial_year())
        serializer = DuesSerializer(instance, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response({'detail': 'Due Updated'}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class OverrideDueView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        due_disp_id = request.data.get('due_display_id')
        due = Due.objects.get(due_financial_year=get_financial_year(), due_display_id=due_disp_id)
        ledger = Ledger.objects.filter(txn_due_id=due_disp_id, txn_financial_year=get_financial_year())
        ledger.delete()
        due.applied = 0
        due.save()

        return Response({'detail': 'Done'}, status=status.HTTP_200_OK)


class MarkAsPaidView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        due_disp_id = request.data.get('due_display_id')
        due = Due.objects.get(due_financial_year=get_financial_year(), due_display_id=due_disp_id)
        ledger = Ledger.objects.filter(txn_due_id=due_disp_id, txn_financial_year=get_financial_year())
        done = []
        for record in ledger:
            key = (record.txn_member, record.txn_due_id)

            if key not in done:
                memberduerecs = Ledger.objects.filter(txn_member=record.txn_member, txn_due_id=record.txn_due_id)
                due_id = due.due_display_id
                member = record.txn_member
                family = record.txn_family
                txn_remarks = 'MANUALLY MARKED AS PAID'
                account_serial = due.account_serial
                amount = 0
                for recs in memberduerecs:
                    if recs.txn_type == "DUE":
                        amount += recs.txn_amount
                    if recs.txn_type == "PAID":
                        amount += recs.txn_amount
                    if recs.txn_type == "OVERRIDE":
                        amount += recs.txn_amount
                if amount > 0:
                    receipt = wf.due_payment_receipt_record_create(due_id, amount, member, family, account_serial,
                                                               request.user.username, txn_remarks) + '/'
                    wf.receipt_invoice_record_create(receipt, amount, family, request.user.username,
                                                 txn_remarks + '(' + due_id + ')')
                
                    done.append(key)
        due.paid_together = True
        due.save()

        return Response({'detail': 'Done'}, status=status.HTTP_200_OK)


class CancelReceiptView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        invoice = request.data.get("Receipt No.")
        family = request.data.get("Family No.")
        receipt_records = ReceiptsInvoice.objects.get(receipt_invoice_id=invoice)
        receipts = receipt_records.receipt_ids.split('/')[:-1]
        for receipt in receipts:
            receipt_record = Receipt.objects.get(receipt_id=receipt)
            wf.ledger_record_create(receipt_record.receipt_due_id, "PAYMENT CANCELLED", receipt_record.receipt_amount,
                                    receipt_record.receipt_member,
                                    receipt_record.receipt_family, "Payment Cancelled", receipt_record.account_serial,
                                    request.user.username)
            AccountRecord.objects.create(account_serial=receipt_record.account_serial, financial_year=get_financial_year(),
                                          type="CANCELLED RECEIPT",
                                          add_to_cash_in_hand=-(receipt_record.receipt_amount), add_to_cash_in_bank=0,
                                          add_to_current_balance=-(receipt_record.receipt_amount),
                                          txn_time=timezone.now(), txn_ref_id=receipt_record.txn_id,
                                          login_user=request.user.username)
            receipt_record.is_active = False
            receipt_record.save()
        receipt_records.is_active = False
        receipt_records.save()
        return Response(status=status.HTTP_200_OK)


class UndoMarkAsPaidView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        due_id = request.data.get("due_display_id")
        due = Due.objects.get(due_display_id=due_id, due_financial_year=get_financial_year())
        remarks = 'MANUALLY MARKED AS PAID' + '(' + due_id + ')'
        receipt_records = ReceiptsInvoice.objects.filter(receipt_financial_year=get_financial_year(), remarks=remarks)
        for records in receipt_records:
            receipts = records.receipt_ids.split('/')[:-1]
            for receipt in receipts:
                receipt_record = Receipt.objects.get(receipt_id=receipt)
                ledger_record = Ledger.objects.get(txn_id=receipt_record.txn_id)
                AccountRecord.objects.create(account_serial=receipt_record.account_serial,
                                              financial_year=get_financial_year(),
                                              type="CANCELLED RECEIPT",
                                              add_to_cash_in_hand=-(receipt_record.receipt_amount), add_to_cash_in_bank=0,
                                              add_to_current_balance=-(receipt_record.receipt_amount),
                                              txn_time=timezone.now(), txn_ref_id=receipt_record.txn_id,
                                              login_user=request.user.username)
                ledger_record.delete()
                receipt_record.delete()
            records.delete()
        due.paid_together = False
        due.save()
        return Response(status=status.HTTP_200_OK)


class ApplyFineView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        member = request.data.get('jp')
        amount = request.data.get('amount')
        reason = request.data.get('reason')
        account_serial = request.data.get('account')
        member_details = Member.objects.get(jp_number=member, is_active=1, is_alive=1)
        wf.ledger_record_create(get_financial_year()+'/FINE', 'FINE', amount, member, member_details.family_number,
                                reason, account_serial, request.user.username, txn_financial_year=get_financial_year())

        return Response({'detail': f'Fine Applied to {member_details.name} with Member No. {member}'}, status=status.HTTP_200_OK)


class CloseFinancialYearView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        if request.data.get('confirmation') == 'I-Accept':
            async_task("MainScreen.worker.year_closure", request.user.username)

            return Response({'detail': 'Current Financial Year Has Been Successfully Closed'}, status=status.HTTP_200_OK)

        return Response(status=status.HTTP_400_BAD_REQUEST)


class OpenFinancialYearView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        if request.data.get('confirmation') == 'I-Accept':
            async_task("MainScreen.worker.year_open", request.user.username)

            return Response({'detail': 'New Financial Year Has Been Successfully Created'}, status=status.HTTP_200_OK)

        return Response(status=status.HTTP_400_BAD_REQUEST)
