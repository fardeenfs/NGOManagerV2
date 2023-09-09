from rest_framework import serializers
from .models import Vouchers, VoucherTypes

class VoucherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vouchers
        fields = '__all__'

class VoucherTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoucherTypes
        fields = 'voucher_type','voucher_amount','remarks',' voucher_head','voucher_subhead', 'voucher_member_name','voucher_member_address'
