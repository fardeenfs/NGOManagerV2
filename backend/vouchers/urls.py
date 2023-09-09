from django.contrib import admin
from django.contrib.auth.views import LoginView
from django.urls import path,include

from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('print/',views.VoucherPrintView.as_view(),name="print"),
    path('cancel/',views.CancelVoucher.as_view(),name="cancel voucher"),
    path('incomevouchertypes/', views.IncomeVoucherTypeView.as_view(), name='incomevouchertype-list'),
    path('expensevouchertypes/', views.ExpenseVoucherTypeView.as_view(), name='expensevouchertype-list'),
    path('voucherrecords/', views.VoucherRecordView.as_view(), name='voucherrecord-list'),
]