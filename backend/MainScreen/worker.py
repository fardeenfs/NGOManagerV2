import datetime
import MainScreen.writefuncs as wf
from django.utils import timezone


from MainScreen.models import Member, Due, Receipt, Ledger, Sitewide, Account, AccountTransactionRecord, ReceiptsInvoice, AccountRecord, MemberFamilyChange
from vouchers.models import Vouchers

def get_financial_year():
    financial_year = Sitewide.objects.latest('financial_id')
    return financial_year.financial_term_code

def calculate_kudishika():
    dues = Due.objects.filter(due_financial_year=get_financial_year())
    final = {}
    for due in dues:
        ledger = Ledger.objects.filter(txn_due_id=due.due_display_id, txn_financial_year=get_financial_year())
        due_recs = {}
        for rec in ledger:
            if rec.txn_member in due_recs.keys():
                due_recs[rec.txn_member] += rec.txn_amount
            else:
                due_recs[rec.txn_member] = rec.txn_amount
        if due.due_fineamt != 0:
            for member in due_recs.keys():
                if due_recs[member] > 0:
                    due_recs[member] += due.due_fineamt
        for member in due_recs.keys():
            if member in final.keys():
                final[member] += due_recs[member]
            else:
                final[member] = due_recs[member]
    return final



def year_closure(username):
    new_kudishika = calculate_kudishika()
    financial_year = Sitewide.objects.latest('financial_id')
    financial_year.year_end_date = datetime.datetime.now()
    financial_year.save()
    last_financial_year = Sitewide.objects.latest('financial_id')
    members = Member.objects.filter(is_alive=1, is_active=1)
    due_members = Member.objects.filter(is_active=1, age__gte=18)
    # Increasing Memeber Age And Calculating Due Type 'Kudisika'
    for member in members:
        member.age += 1
        member.save()
    for member in due_members:
        due = Due.objects.get(due_display_id='DM-10')
        if member.jp_number in new_kudishika.keys():
            txn_due_id = "FM-" + str(last_financial_year.financial_id + 1) + '/' + 'DM-10'
            txn_type = 'DUE'
            txn_amount = new_kudishika[member.jp_number]
            txn_member = member.jp_number
            txn_family = member.family_number
            txn_remarks = 'Regular Due'
            wf.ledger_record_create(txn_due_id, txn_type, txn_amount, txn_member, txn_family, txn_remarks,
                                    due.account_serial,
                                    username,
                                    txn_financial_year="FM-" + str(last_financial_year.financial_id + 1))



def year_open(username):
    last_financial_year = Sitewide.objects.latest('financial_id')
    members = Member.objects.filter(is_alive=1, is_active=1)
    due_objects = Due.objects.filter(due_financial_year=get_financial_year()).order_by('due_id')

    accs = Account.objects.order_by('account_serial')

    accrecords = AccountRecord.objects.filter(financial_year=get_financial_year())
    for acc in accs:
        cash_in_hand = 0
        cash_in_bank = 0
        current_balance = 0
        for rec in accrecords:
            if rec.account_serial == acc.account_serial:
                cash_in_hand += rec.add_to_cash_in_hand
                cash_in_bank += rec.add_to_cash_in_bank
                current_balance += rec.add_to_current_balance

        AccountRecord.objects.create(account_serial=acc.account_serial,
                                      financial_year="FM-" + str(last_financial_year.financial_id + 1),
                                      type="OPENING",
                                      add_to_cash_in_hand=cash_in_hand,
                                      add_to_cash_in_bank=cash_in_bank,
                                      add_to_current_balance=current_balance,
                                      txn_time=timezone.now(),
                                      txn_ref_id="NA",
                                      login_user=username)
        acc.opening_balance = current_balance
        acc.save()
    # Resetting the dues table
    for due in due_objects:
        due_disp_id = due.due_display_id.split('/')[-1]
        duecreation = Due.objects.create(
            due_display_id="FM-" + str(last_financial_year.financial_id + 1) + '/' + due_disp_id,
            due_type=due.due_type, due_amount=due.due_amount,
            due_fineamt=due.due_fineamt, due_financial_year="FM-" + str(last_financial_year.financial_id + 1),
            is_head=due.is_head, is_pension=due.is_pension, is_nri=due.is_nri,
            is_govt=due.is_govt,
            is_male=due.is_male, due_active=1, account_serial=due.account_serial,
            applied=0,
            paid_together=0)

    # Creating the new Financial Year

    Sitewide.objects.create(financial_id=last_financial_year.financial_id + 1,
                            financial_term_code="FM-" + str(last_financial_year.financial_id + 1),
                            financial_year='Not Specified',
                            year_start_date=datetime.datetime.now(), year_end_date='1000-01-01')
