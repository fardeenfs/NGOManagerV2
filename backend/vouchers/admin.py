from django.contrib import admin

from .models import VoucherTypes, Vouchers

# Register your models here.
admin.site.register(VoucherTypes)
admin.site.register(Vouchers)