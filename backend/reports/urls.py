from django.urls import path,include

from . import views

urlpatterns = [
    path('', views.ReportsHome.as_view(), name="members report"),
    path('minor-to-major/',views.MinorToMajor.as_view(),name="members aged 18"),
    path('inactive-members/',views.InactiveMembersReports.as_view(),name="inactive members reports"),
    path('get-pending-dues/', views.GetKudishika.as_view(), name="kudishika report"),
    path('get-pending-dues-without-fines/', views.GetKudishikaWithoutFine.as_view(), name="kudishika wo fine report"),
    path('income-vouchers/',views.IncomeVoucher.as_view(),name="income vouchers report"),
    path('expense-vouchers/',views.ExpenseVoucher.as_view(),name="expense vouchers report"),
    path('dues-paid/',views.DuePaidReports.as_view(),name="due paid reports"),
    path('dues-unpaid/',views.DueNotPaidReports.as_view(),name="due not paid reports"),
    path('dues-cancelled/',views.CancelledDueReports.as_view(),name="cancelled due reports"),


    ]