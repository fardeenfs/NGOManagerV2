from rest_framework import serializers
from .models import Due, Ledger, Member

class NewMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['jp_number', 'family_number', 'name', 'is_due_apply', 'is_pension', 'is_nri', 'is_govt', 'is_male', 'is_alive', 'age', 'mobile', 'email', 'description', 'remarks']


class NewFamilySerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['jp_number', 'family_number', 'census_number', 'house_name', 'area', 'postoffice', 'address', 'name', 'is_due_apply', 'is_pension', 'is_nri', 'is_govt', 'is_male', 'is_alive', 'age', 'mobile', 'email', 'description', 'remarks']


class EditMemberSerializer(serializers.ModelSerializer):
    class Meta:
        model = Member
        fields = ['jp_number', 'family_number', 'census_number', 'house_name', 'area', 'postoffice', 'address', 'name', 'is_due_apply', 'is_pension', 'is_nri', 'is_govt', 'is_male', 'is_alive', 'age', 'mobile', 'email', 'description', 'remarks']

class DuesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Due
        fields = '__all__'

class LedgerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Ledger
        fields = '__all__'
