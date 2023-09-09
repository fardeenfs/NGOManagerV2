from django.shortcuts import render
import decimal
from datetime import datetime
from django.shortcuts import render, redirect
from vouchers.models import Vouchers, VoucherTypes
from MainScreen.models import Member, Due, Receipt, Ledger, Sitewide, Account, AccountTransactionRecord

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from django.contrib.auth.decorators import login_required
import random
import csv
import pandas as pd

import io
import xlsxwriter
from django.http import HttpResponse, FileResponse

from django.http import HttpResponse

context = {}


def get_financial_year():
    financial_year = Sitewide.objects.latest('financial_id')
    return financial_year.financial_term_code


def getfamilies(rward):
    if rward != 'All':
        heads = Member.objects.filter(is_head=1, area=rward, is_active=1)
    else:
        heads = Member.objects.filter(is_head=1, is_active=1)
    heads = heads.extra(select={
        'serial_a': "SUBSTR(serial, 3)",
        'serial_b': "CAST(substr(serial, 4) AS DECIMAL)"})
    heads = heads.order_by('serial_b')
    print(heads[0].serial_b)

    return heads


def getmembers(rward):
    if rward != 'All':
        members = Member.objects.filter(area=rward, is_active=1)
    else:
        members = Member.objects.filter(is_active=1)
    members = members.extra(select={
        'serial_a': "SUBSTR(serial, 3)",
        'serial_b': "CAST(substr(serial, 4) AS DECIMAL)"})
    members = members.order_by('serial_b')
    return members


def getmembers_no_d(rward):
    memberslist = []
    if rward != 'All':
        members = Member.objects.filter(area=rward, is_active=1)
    else:
        members = Member.objects.filter(is_active=1)
    members = members.order_by('family_number')
    for member in members:
        if (member.is_head == 1) or float(member.jp_number).is_integer():
            print(member)
            memberslist.append(member)
    return memberslist


class ReportsHome(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        final = []
        rtype = request.POST["report-type"]
        rfilter = request.POST["filter-type"]
        rward = request.POST["ward-type"]
        memlist = []
        if rtype == 'FamilyList':
            memlist = getfamilies(rward)
        elif rtype == 'MembersList':
            memlist = getmembers(rward)
        elif rtype == 'MembersListNoD':
            memlist = getmembers_no_d(rward)

        for member in memlist:
            if rfilter == 'All' or \
               (rfilter == 'Nri' and member.is_nri) or \
               (rfilter == 'Employee' and member.is_govt) or \
               (rfilter == 'Pension' and member.is_pension):
                final.append(member)

        final_list = []
        for member in final:
            final_list.append(
                [member.serial, member.jp_number, member.family_number, member.census_number, member.name,
                 member.house_name, member.area, member.is_nri, member.is_govt, member.is_pension])

        buffer = io.BytesIO()
        workbook = xlsxwriter.Workbook(buffer)
        worksheet = workbook.add_worksheet()
        header = ['SERIAL', 'JP NUMBER', 'FAMILY NUMBER', 'CENSUS NUMBER', 'NAME', 'HOUSE NAME', 'WARD', 'NRI', 'GOVT',
                  'PENSION']
        worksheet.write_row(0, 0, header)
        for row_num, member in enumerate(final_list, start=1):
            worksheet.write_row(row_num, 0, member)
        workbook.close()
        buffer.seek(0)

        response = FileResponse(buffer, as_attachment=True, filename=rtype + '.xlsx')
        response['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        return response




class GetKudishika(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
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
                if due.fine_applied != 1:
                    for member in due_recs.keys():
                        if due_recs[member] > 0:
                            due_recs[member] += due.due_fineamt
            for member in due_recs.keys():
                if member in final.keys():
                    final[member] += due_recs[member]
                else:
                    final[member] = due_recs[member]


        to_excel = []
        total = 0
        for key, value in final.items():
            try:
                member = Member.objects.get(jp_number=key, is_active=1)
            except Exception:
                member = Member.objects.get(jp_number=key)
            to_excel.append([member.serial, member.jp_number, member.family_number, member.census_number, member.name,
                            member.house_name, member.area, value])
            total += float(value)
        buffer = io.BytesIO()
        workbook = xlsxwriter.Workbook(buffer)
        worksheet = workbook.add_worksheet()
        header = ['SERIAL', 'JP NUMBER', 'FAMILY NUMBER', 'CENSUS NUMBER', 'NAME', 'HOUSE NAME', 'WARD','AMOUNT']
        worksheet.write_row(0, 0, header)
        row = 1
        col = 0
        for member in to_excel:
            worksheet.write_row(row, col, member)
            row += 1
        worksheet.write(row + 1, 6, "TOTAL")
        worksheet.write(row + 1, 7, total)
        workbook.close()
        buffer.seek(0)

        response = FileResponse(buffer, as_attachment=True, filename= "Kudishika With Fines" + '.xlsx')
        response['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        return response


class GetKudishikaWithoutFine(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
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
                if due.fine_applied == 1:
                    for member in due_recs.keys():
                        if due_recs[member] > 0:
                            due_recs[member] -= due.due_fineamt
            for member in due_recs.keys():
                if member in final.keys():
                    final[member] += due_recs[member]
                else:
                    final[member] = due_recs[member]


        to_excel = []
        total = 0
        for key, value in final.items():
            try:
                member = Member.objects.get(jp_number=key, is_active=1)
            except Exception:
                member = Member.objects.get(jp_number=key)
            to_excel.append([member.serial, member.jp_number, member.family_number, member.census_number, member.name,
                            member.house_name, member.area, value])
            total += float(value)
        buffer = io.BytesIO()
        workbook = xlsxwriter.Workbook(buffer)
        worksheet = workbook.add_worksheet()
        header = ['SERIAL', 'JP NUMBER', 'FAMILY NUMBER', 'CENSUS NUMBER', 'NAME', 'HOUSE NAME', 'WARD','AMOUNT']
        worksheet.write_row(0, 0, header)
        row = 1
        col = 0
        for member in to_excel:
            worksheet.write_row(row, col, member)
            row += 1
        worksheet.write(row + 1, 6, "TOTAL")
        worksheet.write(row + 1, 7, total)
        workbook.close()
        buffer.seek(0)
        response = FileResponse(buffer, as_attachment=True, filename= "Kudishika Without Fines" + '.xlsx')
        response['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        return response


class IncomeVoucher(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.POST['btn'] == 'monthly':
            start = request.POST['start-date']
            end = request.POST['end-date']
            vouchers = Vouchers.objects.filter(voucher_type='INCOME', voucher_date__range=[start, end]).order_by(
                'voucher_date')
            to_excel = []
            for voucher in vouchers:
                to_excel.append(
                    [str(voucher.voucher_display_id), voucher.voucher_date.strftime("%Y-%m-%d"), voucher.voucher_type,
                    voucher.voucher_head, voucher.voucher_subhead, voucher.voucher_amount,
                    voucher.voucher_member_name,
                    voucher.voucher_member_address, voucher.remarks])
            buffer = io.BytesIO()
            workbook = xlsxwriter.Workbook(buffer)
            worksheet = workbook.add_worksheet()
            header = ['VOUCHER ID', 'VOUCHER DATE', 'VOUCHER TYPE', 'VOUCHER HEAD', 'VOUCHER SUBHEAD', 'AMOUNT', 'NAME',
                    'ADDRESS', 'REMARKS']
            worksheet.write_row(0, 0, header)
            row = 1
            col = 0
            for member in to_excel:
                worksheet.write_row(row, col, member)
                row += 1
            workbook.close()
            buffer.seek(0)
            return FileResponse(buffer, as_attachment=True,
                                filename="Income Voucher Report Custom(" + str(start) + ' to ' + end + ').xlsx')
        else:
            voucher_types = VoucherTypes.objects.all()
            voucher_types = voucher_types.order_by('voucher_head')
            to_excel = []
            for voucher_type in voucher_types:
                vouchers = Vouchers.objects.filter(voucher_type='INCOME', voucher_financial_year=get_financial_year(),
                                                voucher_reference_id=voucher_type.serial)
                total = 0
                for voucher in vouchers:
                    total += voucher.voucher_amount
                if total != 0:
                    to_excel.append(
                        [voucher_type.voucher_head, voucher_type.voucher_subhead, voucher_type.type,
                        total])
            buffer = io.BytesIO()
            workbook = xlsxwriter.Workbook(buffer)
            worksheet = workbook.add_worksheet()
            header = ['VOUCHER HEAD', 'VOUCHER SUBHEAD', 'VOUCHER TYPE', 'AMOUNT']
            worksheet.write_row(0, 0, header)
            row = 1
            col = 0
            for member in to_excel:
                worksheet.write_row(row, col, member)
                row += 1
            workbook.close()
            buffer.seek(0)
            return FileResponse(buffer, as_attachment=True,
                                filename="Income Voucher Report Annual" + ".xlsx")


class ExpenseVoucher(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.POST['btn'] == 'monthly':
            start = request.POST['startdate']
            end = request.POST['enddate']
            vouchers = Vouchers.objects.filter(voucher_type='EXPENSE', voucher_date__range=[start, end]).order_by(
                'voucher_date')
            to_excel = []
            for voucher in vouchers:
                to_excel.append(
                    [str(voucher.voucher_display_id), voucher.voucher_date.strftime("%Y-%m-%d"), voucher.voucher_type,
                    voucher.voucher_head,
                    voucher.voucher_subhead, voucher.voucher_amount, voucher.voucher_member_name,
                    voucher.voucher_member_address, voucher.remarks])
            buffer = io.BytesIO()
            workbook = xlsxwriter.Workbook(buffer)
            worksheet = workbook.add_worksheet()
            header = ['VOUCHER ID', 'VOUCHER DATE', 'VOUCHER TYPE', 'VOUCHER HEAD', 'VOUCHER SUBHEAD', 'AMOUNT', 'NAME',
                    'ADRESS', 'REMARKS']
            worksheet.write_row(0, 0, header)
            row = 1
            col = 0
            for member in to_excel:
                worksheet.write_row(row, col, member)
                row += 1
            workbook.close()
            buffer.seek(0)

            return FileResponse(buffer, as_attachment=True,
                                filename="Expense Voucher Report Custom(" + str(start) + ' to ' + end + ').xlsx')
        else:
            voucher_types = VoucherTypes.objects.all()
            voucher_types = voucher_types.order_by('voucher_head')
            to_excel = []
            for voucher_type in voucher_types:
                vouchers = Vouchers.objects.filter(voucher_type='EXPENSE', voucher_financial_year=get_financial_year(),
                                                voucher_reference_id=voucher_type.serial)
                total = 0
                for voucher in vouchers:
                    total += voucher.voucher_amount
                if total != 0:
                    to_excel.append(
                        [voucher_type.voucher_head, voucher_type.voucher_subhead, voucher_type.type,
                        total])
            buffer = io.BytesIO()
            workbook = xlsxwriter.Workbook(buffer)
            worksheet = workbook.add_worksheet()
            header = ['VOUCHER HEAD', 'VOUCHER SUBHEAD', 'VOUCHER TYPE', 'AMOUNT']
            worksheet.write_row(0, 0, header)
            row = 1
            col = 0
            for member in to_excel:
                worksheet.write_row(row, col, member)
                row += 1
            workbook.close()
            buffer.seek(0)
            return FileResponse(buffer, as_attachment=True,
                                filename="Expense Voucher Report Annual" + ".xlsx")


class DuePaidReports(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.POST['btn'] == 'yearly':
            receipts = Receipt.objects.filter(is_active=True, receipt_financial_year=get_financial_year()).order_by(
                'receipt_family')
        else:
            receipts = Receipt.objects.filter(is_active=True, receipt_date__gte=request.POST['startdate'],
                                            receipt_date__lte=request.POST['enddate']).order_by('receipt_family')
        context = {}
        for record in receipts:
            if record.receipt_due_id in context.keys():
                if record.receipt_member in context[record.receipt_due_id].keys():
                    context[record.receipt_due_id][record.receipt_member] += abs(record.receipt_amount)
                else:
                    context[record.receipt_due_id][record.receipt_member] = abs(record.receipt_amount)
            else:
                context[record.receipt_due_id] = {}
                context[record.receipt_due_id][record.receipt_member] = abs(record.receipt_amount)
        buffer = io.BytesIO()
        workbook = xlsxwriter.Workbook(buffer)
        for due_id in context.keys():
            due = Due.objects.get(due_display_id=due_id)
            worksheet = workbook.add_worksheet(due.due_type)
            header = ['JP NUMBER', 'MEMBER NAME', 'FAMILY NUMBER', 'HOUSE NAME', 'TYPE', 'AMOUNT']
            worksheet.write_row(0, 0, header)
            row = 1
            col = 0
            for member in context[due_id]:
                try:
                    member_details = Member.objects.get(jp_number=member)
                except:
                    member_details = Member.objects.get(jp_number=member, is_active=1)
                worksheet.write_row(row, col, [member, member_details.name, member_details.family_number,
                                            member_details.house_name,
                                            due.due_type, context[due_id][member]])
                row += 1

        workbook.close()
        buffer.seek(0)
        if request.POST['btn'] == 'yearly':
            return FileResponse(buffer, as_attachment=True,
                                filename="Paid Dues Report Annual" + ".xlsx")
        else:
            return FileResponse(buffer, as_attachment=True,
                                filename="Paid Dues Report (" + request.POST['startdate'] + ' to ' + request.POST[
                                    'enddate'] + ").xlsx")


class DueNotPaidReports(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.POST['btn'] == 'yearly':
            ledger = Ledger.objects.filter(txn_financial_year=get_financial_year()).order_by('txn_family')
        else:
            ledger = Ledger.objects.filter(txn_date__gte=request.POST['startdate'],
                                        txn_date__lte=request.POST['enddate']).order_by('txn_family')
        context = {}
        for record in ledger:
            if record.txn_due_id in context.keys():
                if record.txn_member in context[record.txn_due_id].keys():
                    context[record.txn_due_id][record.txn_member] += record.txn_amount
                else:
                    context[record.txn_due_id][record.txn_member] = record.txn_amount
            else:
                context[record.txn_due_id] = {}
                context[record.txn_due_id][record.txn_member] = record.txn_amount
        print(context)
        buffer = io.BytesIO()
        workbook = xlsxwriter.Workbook(buffer)
        for due_id in context.keys():
            due = Due.objects.get(due_display_id=due_id)
            worksheet = workbook.add_worksheet(due.due_type)
            header = ['JP NUMBER', 'MEMBER NAME', 'FAMILY NUMBER', 'HOUSE NAME', 'TYPE', 'AMOUNT']
            worksheet.write_row(0, 0, header)
            row = 1
            col = 0
            for member in context[due_id]:
                if context[due_id][member] > 0:
                    try:
                        member_details = Member.objects.get(jp_number=member)
                    except:
                        member_details = Member.objects.get(jp_number=member, is_active=1)
                    worksheet.write_row(row, col, [member, member_details.name, member_details.family_number,
                                                member_details.house_name,
                                                due.due_type, context[due_id][member]])
                    row += 1

        workbook.close()
        buffer.seek(0)
        if request.POST['btn'] == 'yearly':
            return FileResponse(buffer, as_attachment=True,
                                filename="Unpaid Dues Report Annual" + ".xlsx")
        else:
            return FileResponse(buffer, as_attachment=True,
                                filename="Unpaid Dues Report (" + request.POST['startdate'] + ' to ' + request.POST[
                                    'enddate'] + ").xlsx")


class CancelledDueReports(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        if request.POST['btn'] == 'yearly':
            ledger = Ledger.objects.filter(txn_type='OVERRIDE', txn_financial_year=get_financial_year()).order_by(
                'txn_family')
        else:
            ledger = Ledger.objects.filter(txn_type='OVERRIDE', txn_date__gte=request.POST['startdate'],
                                        txn_date__lte=request.POST['enddate']).order_by('txn_family')
        context = {}
        for record in ledger:
            if record.txn_member in context.keys():
                if record.txn_due_id in context[record.txn_member].keys():
                    context[record.txn_member][record.txn_due_id] += abs(record.txn_amount)
                else:
                    context[record.txn_member][record.txn_due_id] = abs(record.txn_amount)
            else:
                context[record.txn_member] = {}
                context[record.txn_member][record.txn_due_id] = abs(record.txn_amount)
        print(context)
        to_excel = []
        for member in context.keys():
            try:
                member_details = Member.objects.get(jp_number=member)
            except:
                member_details = Member.objects.get(jp_number=member, is_active=1)
            if len(list(context[member].keys())) == 1:
                due_id = list(context[member].keys())[0]
                due = Due.objects.get(due_display_id=due_id)
                to_excel.append(
                    [member, member_details.name, member_details.family_number, member_details.house_name,
                    due.due_type, context[member][due_id]])
            else:
                due_ids = list(context[member].keys())
                for due_id in due_ids:
                    due = Due.objects.get(due_display_id=due_id)
                    to_excel.append(
                        [member, member_details.name, member_details.family_number, member_details.house_name,
                        due.due_type, context[member][due_id]])
        buffer = io.BytesIO()
        workbook = xlsxwriter.Workbook(buffer)
        worksheet = workbook.add_worksheet()
        header = ['JP NUMBER', 'MEMBER NAME', 'FAMILY NUMBER', 'HOUSE NAME', 'TYPE', 'AMOUNT']
        worksheet.write_row(0, 0, header)
        row = 1
        col = 0
        for member in to_excel:
            worksheet.write_row(row, col, member)
            row += 1
        workbook.close()
        buffer.seek(0)
        if request.POST['btn'] == 'yearly':
            return FileResponse(buffer, as_attachment=True,
                                filename="Cancelled Dues Report Annual" + ".xlsx")
        else:
            return FileResponse(buffer, as_attachment=True,
                                filename="Cancelled Dues Report (" + request.POST['startdate'] + ' to ' + request.POST[
                                    'enddate'] + ").xlsx")


class InactiveMembersReports(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        members = Member.objects.all()
        context = {}
        for member in members:
            if member.jp_number in context.keys():
                if context[member.jp_number] is False:
                    context[member.jp_number] = member.is_active
            else:
                context[member.jp_number] = member.is_active
        to_excel = []
        for member in context.keys():
            if context[member] is False:
                member = Member.objects.get(jp_number=member, is_active=False)
                to_excel.append([member.serial, member.jp_number, member.name, member.family_number, member.house_name,
                                member.remarks, member.area])
        buffer = io.BytesIO()
        workbook = xlsxwriter.Workbook(buffer)
        worksheet = workbook.add_worksheet()
        header = ['SERIAL', 'JP NUMBER', 'MEMBER NAME', 'FAMILY NUMBER', 'HOUSE NAME', 'REASON', 'WARD']
        worksheet.write_row(0, 0, header)
        row = 1
        col = 0
        for member in to_excel:
            worksheet.write_row(row, col, member)
            row += 1
        workbook.close()
        buffer.seek(0)


        response = FileResponse(buffer, as_attachment=True, filename= "Inactive Members Report" + '.xlsx')
        response['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        return response



class MinorToMajor(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        members = Member.objects.filter(age__gte=18, is_male=1, is_active=1)
        final_list = []
        for member in members:
            if float(member.jp_number) != int(member.jp_number):
                final_list.append(
                    [member.serial, member.jp_number, member.family_number, member.census_number, member.name,
                    member.house_name, member.age,
                    member.area, member.is_nri, member.is_govt, member.is_pension])
        buffer = io.BytesIO()
        workbook = xlsxwriter.Workbook(buffer)
        worksheet = workbook.add_worksheet()
        header = ['SERIAL', 'JP NUMBER', 'FAMILY NUMBER', 'CENSUS NUMBER', 'NAME', 'HOUSE NAME', 'AGE', 'WARD', 'NRI',
                'GOVT', 'PENSION']
        worksheet.write_row(0, 0, header)
        row = 1
        col = 0
        for member in final_list:
            worksheet.write_row(row, col, member)
            row += 1
        workbook.close()
        buffer.seek(0)

        response = FileResponse(buffer, as_attachment=True, filename= "Members Aged 18 List" + '.xlsx')
        response['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        return response
