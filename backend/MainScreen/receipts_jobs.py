# import pyrebase
#
# from MainScreen.models import Sitewide
#
# config = {
#     "apiKey": "AIzaSyAjQ-lKEMeRVp7XfQhBhDRubnSQZEhIMNI",
#     "authDomain": "mmjpalli.firebaseapp.com",
#     "databaseURL": "https://mmjpalli-default-rtdb.firebaseio.com",
#     "projectId": "mmjpalli",
#     "storageBucket": "mmjpalli.appspot.com",
#     "messagingSenderId": "576565680961",
#     "appId": "1:576565680961:web:88a78526ea90150a139fc0",
#     "measurementId": "G-L4D5DXFDG3"
# }
#
# firebase = pyrebase.initialize_app(config)
# db = firebase.database()
#
#
# def get_financial_year():
#     financial_year = Sitewide.objects.latest('financial_id')
#     return financial_year.financial_term_code
#
#
# def create_receipt(dueid, member, family, date, amount, financial_year, account_serial, txn_id, login_user):
#     existing_receipt_ids = db.child("receipts").child('R').child(financial_year).get().each()
#     ids = []
#     if existing_receipt_ids is None:
#         auto_id = 1
#     else:
#         for rec in existing_receipt_ids:
#             ids.append(rec.key())
#             auto_id = max(ids) + 1
#     receipt_id = 'Rec/' + financial_year + '/' + str(auto_id)
#     data = {"due_id": dueid,
#             "member": str(member),
#             "family": str(family),
#             "date": str(date),
#             "amount": str(amount),
#             "financial_year": financial_year,
#             "account_serial": account_serial,
#             "txn_id": str(txn_id),
#             "login_user": login_user,
#             "is_active": 'true'}
#     db.child("receipts").child(str(receipt_id)).set(data)
#     return receipt_id
#
#
# def create_receipt_invoice(receipt_ids, total_amount, family, login_user, financial_year, date,
#                            txn_remarks="No Remarks"):
#     existing_receipt_invoice_ids = db.child("receipt-invoices").child('R').child(financial_year).get().each()
#     ids = []
#     if existing_receipt_invoice_ids is None:
#         auto_id = 1
#     else:
#         for rec in existing_receipt_invoice_ids:
#             ids.append(rec.key())
#         auto_id = max(ids) + 1
#     receipt_invoice_id = 'R/' + financial_year + '/' + str(auto_id)
#     data = {"financial_year": financial_year,
#             "family": str(family),
#             "receipt_ids": str(receipt_ids),
#             "total_amount": str(total_amount),
#             "txn_remarks": txn_remarks,
#             "date": str(date),
#             "login_user": login_user,
#             "is_active": 'true'}
#     db.child("receipt-invoices").child(receipt_invoice_id).set(data)
#
#
# def filter_receiptinvoices_by_family(family):
#     existing_receipt_invoices = db.child("receipt-invoices").child('R').child(get_financial_year()).get().each()
#     ids = []
#     for rec in existing_receipt_invoices:
#         value = db.child("receipt-invoices").child('R').child(get_financial_year()).child(rec.key()).child("family").get().val()
#         print(value)
#         if value == str(family):
#             ids.append("R/" + get_financial_year() + '/' + str(rec.key()))
#
#     print(ids)
