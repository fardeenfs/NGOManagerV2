from django import forms

from MainScreen.models import Member, Due

choice = (
    (1, "Included"),
    (0, "Excluded"),
    (-1, "Not Applicable")
)


class NewDue(forms.Form):
    due_id = forms.CharField(label='Due ID')
    due_type = forms.CharField(label='Due Type')
    due_amount = forms.DecimalField(label='Due Amount')
    due_fineamt = forms.DecimalField(label='Fine Amount (Yearly)')
    is_head = forms.ChoiceField(choices=choice)
    is_pension = forms.ChoiceField(choices=choice)
    is_nri = forms.ChoiceField(choices=choice)
    is_govt = forms.ChoiceField(choices=choice)
    is_male = forms.ChoiceField(choices=choice)
    account_serial = forms.CharField(label='Account Serial')


ward_choices = (
    ("Moolavattom ward", "Moolavattom ward"),
    ("Masjid ward", "Masjid ward"),
    ("Sasthavattom ward", "Sasthavattom ward")
)


class NewMember(forms.Form):
    family_number = forms.IntegerField()
    jp_number = forms.DecimalField(max_digits=1000, decimal_places=2)
    name = forms.CharField()
    is_due_apply = forms.BooleanField(label='Is Due Apply?')
    is_pension = forms.BooleanField(required=False, label='Is Pension?')
    is_nri = forms.BooleanField(required=False, label='Is NRI?')
    is_govt = forms.BooleanField(required=False, label='Is Govt?')
    is_male = forms.BooleanField(required=False, label='Is Male?')
    is_alive = forms.BooleanField(required=False, label='Is Alive?')
    age = forms.IntegerField()
    mobile = forms.IntegerField(required=False)
    email = forms.CharField(required=False)
    description = forms.CharField(required=False)
    remarks = forms.CharField(required=False)

    def __init__(self, *args, **kwargs):
        super(NewMember, self).__init__(*args, **kwargs)
        self.fields['name'].widget.attrs['cols'] = 40


class NewFamily(forms.Form):
    family_no = forms.IntegerField()
    census_no = forms.IntegerField()
    house_name = forms.CharField()
    area = forms.ChoiceField(choices=ward_choices)
    postoffice = forms.CharField()
    address = forms.CharField()
    jp_number = forms.DecimalField(max_digits=1000, decimal_places=2)
    name = forms.CharField()
    is_due_apply = forms.BooleanField(label='Is Due Apply?')
    is_pension = forms.BooleanField(required=False, label='Is Pension?')
    is_nri = forms.BooleanField(required=False, label='Is NRI?')
    is_govt = forms.BooleanField(required=False, label='Is Govt?')
    is_male = forms.BooleanField(required=False, label='Is Male?')
    is_alive = forms.BooleanField(required=False, label='Is Alive?')
    age = forms.IntegerField()
    mobile = forms.IntegerField(required=False)
    email = forms.CharField(required=False)
    description = forms.CharField(required=False)
    remarks = forms.CharField(required=False)


class EditMember(forms.ModelForm):
    class Meta:
        model = Member
        exclude = ['serial', 'financial_year_serial', 'jp_number',
                   'description']
        widgets = {
            'area': forms.Select(choices=ward_choices),
        }

    def __init__(self, *args, **kwargs):
        super(EditMember, self).__init__(*args, **kwargs)
        self.fields['name'].widget.attrs['cols'] = 22
        self.fields['name'].widget.attrs['rows'] = 1
        self.fields['house_name'].widget.attrs['cols'] = 22
        self.fields['house_name'].widget.attrs['rows'] = 1
        self.fields['family_number'].widget.attrs['cols'] = 22
        self.fields['family_number'].widget.attrs['rows'] = 1
        self.fields['email'].widget.attrs['cols'] = 22
        self.fields['email'].widget.attrs['rows'] = 1
        self.fields['area'].widget.attrs['cols'] = 22
        self.fields['area'].widget.attrs['rows'] = 1
        self.fields['address'].widget.attrs['cols'] = 22
        self.fields['address'].widget.attrs['rows'] = 1
        self.fields['remarks'].widget.attrs['cols'] = 22
        self.fields['remarks'].widget.attrs['rows'] = 1
        self.fields['postoffice'].widget.attrs['cols'] = 22
        self.fields['postoffice'].widget.attrs['rows'] = 1

        self.validate = kwargs.pop('validate', False)
        self.fields['email'].required = False
        self.fields['house_name'].required = False
        self.fields['mobile'].required = False
        self.fields['remarks'].required = False
        self.fields['address'].required = False
        self.fields['area'].required = False
        self.fields['postoffice'].required = False

        self.fields['name'].label = "Name"
        self.fields['is_active'].label = "Is Active?"
        self.fields['is_head'].label = "Is Head?"
        self.fields['is_due_apply'].label = "Is Due Apply?"
        self.fields['is_pension'].label = "Is Pension?"
        self.fields['is_nri'].label = "Is NRI?"
        self.fields['is_govt'].label = "Is Govt"
        self.fields['is_male'].label = "Is Male?"
        self.fields['is_alive'].label = "Is Alive?"


class EditDues(forms.ModelForm):
    class Meta:
        model = Due
        exclude = ['account_serial', 'due_display_id', 'due_financial_year', 'due_type', 'applied']

    def __init__(self, *args, **kwargs):
        super(EditDues, self).__init__(*args, **kwargs)
        self.fields['due_amount'].label = "Due Amount"
        self.fields['due_fineamt'].label = "Due Fine Amount"
        self.fields['is_head'].label = "Is Head?"
        self.fields['is_pension'].label = "Is Pension?"
        self.fields['is_nri'].label = "Is NRI?"
        self.fields['is_govt'].label = "Is Govt"
        self.fields['is_male'].label = "Is Male?"
        self.fields['due_active'].label = "Due Active?"
