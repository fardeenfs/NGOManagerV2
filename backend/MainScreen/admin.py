from django.apps import apps
from django.contrib import admin

from .models import Member, Due, Receipt, Ledger, Sitewide, AccountRecord, Account, AccountTransactionRecord,  ReceiptsInvoice

# Register your models here.

admin.site.register(Member)
admin.site.register(Due)
admin.site.register(Receipt)
admin.site.register(Ledger)
admin.site.register(Sitewide)
admin.site.register(AccountRecord)
admin.site.register(Account)
admin.site.register(AccountTransactionRecord)
admin.site.register(ReceiptsInvoice)

