from django.contrib import admin
from django.contrib.auth.views import LoginView
from django.urls import path,include

from . import views
from django.contrib.auth import views as auth_views

urlpatterns = [
    path('', views.HomeLoaded.as_view(), name="home"),
    path('dues/',views.GetDues.as_view(), name="dues"),

    path('invoice/',views.PrintInvoice.as_view(),name="invoice-print"),
    path('new-member/',views.NewMemberView.as_view(),name="new member"),
    path('new-family/',views.NewFamilyView.as_view(),name="new family"),

    path('edit-member/<str:jp>', views.EditMemberView.as_view(), name="edit member"),
    path('dues-settings/',views.DuesListView.as_view(),name="all dues"),
    path('edit-due/', views.EditDuesView.as_view(),name="edit dues"),
    
    path('mark_as_paid/', views.MarkAsPaidView.as_view()),

    path('accounts/', views.AccountsView.as_view(), name='accounts'),
    path('account-info/', views.AccountInfoView.as_view(), name='account info view'),
    path('account-names/', views.AccountNamesView.as_view(), name='account names'),
    path('manual-transactions/', views.ManualTransactionsView.as_view(), name='transactions'),

    path('cancel-receipt/',views.CancelReceiptView.as_view(),name="cancel receipt"),

    path('apply-fines/',views.ApplyFineView.as_view(),name="Fine Apply"),
    path('close-financial-year/',views.CloseFinancialYearView.as_view(),name="Close Financial Year"),
    path('open-financial-year/', views.OpenFinancialYearView.as_view(), name="Open Financial Year"),
    path('addDMFine/',views.addDMfine,name="Add DM Fine"),

    path('apply-due/',views.ApplyDuesAPI.as_view(), name="dues"),
    path('apply-due-manual/',views.ManualDueApplyView.as_view(), name="manual due"),
    path('override-due/', views.OverrideDueView.as_view()),
    path('mark-as-paid/',views.MarkAsPaidView.as_view(),name="mark as paid"),
    path('undo-mark-as-paid/',views.UndoMarkAsPaidView.as_view(),name="undo mark as paid"),
    path('apply-due-fine/',views.ApplyDueFineAPI.as_view(),name="apply due fine"),

    path('new-due/',views.NewDueAPI.as_view(),name="new due"),
]
