import decimal

from django.shortcuts import get_object_or_404, render, redirect

from django.utils import timezone

from MainScreen.models import Sitewide, Account, AccountRecord
from vouchers.models import Vouchers, VoucherTypes
from django.contrib.auth.decorators import login_required


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from .serializers import VoucherSerializer, VoucherTypeSerializer


def get_financial_year():
    financial_year = Sitewide.objects.latest('financial_id')
    return financial_year.financial_term_code


class IncomeVoucherTypeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        income_voucher_types = get_new_income_voucher()
        return Response(income_voucher_types)


class ExpenseVoucherTypeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        expense_voucher_types = get_new_expense_voucher()
        return Response(expense_voucher_types)


class VoucherRecordView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        vouchers = Vouchers.objects.filter(voucher_financial_year=get_financial_year(), is_active=1).order_by('-voucher_date')
        serializer = VoucherSerializer(vouchers, many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)

    def post(self, request):
        name = request.data.get('vname')
        address = request.data.get('vaddress')
        voucher_amt = decimal.Decimal(request.data.get('vamt'))
        voucher_type_head = request.data.get('vhead')
        voucher_type_subhead = request.data.get('vsubhead')
        vremarks = request.data.get('vremarks')

        reference_type_object = VoucherTypes.objects.get(voucher_head=voucher_type_head,
                                                        voucher_subhead=voucher_type_subhead,
                                                        type=request.data.get('type'))
        reference_id = reference_type_object.serial
        reference_type = reference_type_object.type
        account_serial = reference_type_object.account_serial
        voucher_date = timezone.now()

        vouchers = Vouchers.objects.filter(voucher_type=reference_type)
        if vouchers.exists():
            voucher_auto_id = max(v.voucher_auto_id for v in vouchers) + 1
        else:
            voucher_auto_id = 1
        voucher_display_id = 'V/' + reference_type[:3] + '/' + str(voucher_auto_id)

        new_voucher = Vouchers.objects.create(voucher_display_id=voucher_display_id,
                                            voucher_auto_id=voucher_auto_id,
                                            voucher_financial_year=get_financial_year(),
                                            voucher_reference_id=reference_id, voucher_type=reference_type,
                                            voucher_amount=voucher_amt, remarks=vremarks,
                                            voucher_head=voucher_type_head,
                                            voucher_subhead=voucher_type_subhead, voucher_date=voucher_date,
                                            account_serial=account_serial,
                                            voucher_member_name=name, voucher_member_address=address, is_active=1,
                                            login_user=request.user.username)

        accountaccess = Account.objects.get(account_serial=account_serial)
        if reference_type == 'EXPENSE':
            accountaccess.current_balance -= voucher_amt
            accountaccess.cash_in_hand -= voucher_amt
            accountrecord = AccountRecord.objects.create(account_serial=account_serial,
                                                        financial_year=get_financial_year(),
                                                        type="EXP-VOUCHER", add_to_cash_in_hand=-voucher_amt,
                                                        add_to_cash_in_bank=0,
                                                        add_to_current_balance=-voucher_amt, txn_time=voucher_date,
                                                        txn_ref_id=voucher_display_id,
                                                        login_user=request.user.username)
        else:
            accountaccess.current_balance += voucher_amt
            accountaccess.cash_in_hand += voucher_amt
            accountrecord = AccountRecord.objects.create(account_serial=account_serial,
                                                        financial_year=get_financial_year(),
                                                        type="INC-VOUCHER", add_to_cash_in_hand=voucher_amt,
                                                        add_to_cash_in_bank=0,
                                                        add_to_current_balance=voucher_amt, txn_time=voucher_date,
                                                        txn_ref_id=voucher_display_id,
                                                        login_user=request.user.username)
        accountaccess.save()

        return Response(VoucherSerializer(new_voucher).data, status=status.HTTP_201_CREATED)





def get_new_expense_voucher():
    vouchertypes = {}
    types = VoucherTypes.objects.filter(type="EXPENSE", financial_year_serial=get_financial_year())
    for type in types:
        if type.voucher_head not in vouchertypes.keys():
            vouchertypes[type.voucher_head] = []
            vouchertypes[type.voucher_head].append(type.voucher_subhead)
        else:
            vouchertypes[type.voucher_head].append(type.voucher_subhead)
    return vouchertypes


def get_new_income_voucher():
    vouchertypes = {}
    types = VoucherTypes.objects.filter(type="INCOME", financial_year_serial=get_financial_year())
    for type in types:
        if type.voucher_head not in vouchertypes.keys():
            vouchertypes[type.voucher_head] = []
            vouchertypes[type.voucher_head].append(type.voucher_subhead)
        else:
            vouchertypes[type.voucher_head].append(type.voucher_subhead)
    return vouchertypes



class VoucherPrintView(APIView):

    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            voucher_id = request.GET['voucher-id']
            print(voucher_id)
            rec = Vouchers.objects.get(voucher_display_id=voucher_id)
            serializer = VoucherSerializer(rec)
            data = {
                "invoice": {
                    "name": rec.voucher_member_name,
                    "voucher_no": voucher_id,
                    "type": rec.voucher_type,
                    "date": rec.voucher_date,
                    "address": rec.voucher_member_address,
                    "recs": [[rec.voucher_head, rec.voucher_subhead, rec.voucher_amount]],
                    "total": rec.voucher_amount,
                    "remarks": rec.remarks
                }
            }
            return Response(data)
        except Vouchers.DoesNotExist:
            return Response({"error": "Voucher not found"}, status=status.HTTP_404_NOT_FOUND)


class CancelVoucher(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        voucher_id = request.data.get('voucher-id')
        voucher = get_object_or_404(Vouchers, voucher_display_id=voucher_id)
        accountaccess = get_object_or_404(Account, account_serial=voucher.account_serial)
        
        if voucher.voucher_type == 'INCOME':
            accountaccess.current_balance -= voucher.voucher_amount
            accountaccess.cash_in_hand -= voucher.voucher_amount
            accountrecord = get_object_or_404(AccountRecord, txn_ref_id=voucher_id, type="INC-VOUCHER")
        else:
            accountaccess.current_balance += voucher.voucher_amount
            accountaccess.cash_in_hand += voucher.voucher_amount
            accountrecord = get_object_or_404(AccountRecord, txn_ref_id=voucher_id, type="EXP-VOUCHER")

        accountaccess.save()
        voucher.delete()
        accountrecord.delete()
        
        return Response({"message": "Voucher successfully canceled"}, status=status.HTTP_200_OK)
