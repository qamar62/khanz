from django.urls import path

from . import staff, views

urlpatterns = [
    path('staff/login/', staff.StaffLoginView.as_view(), name='staff-login'),
    path('staff/me/', staff.StaffMeView.as_view(), name='staff-me'),
    path('staff/overview/', staff.StaffOverviewView.as_view(), name='staff-overview'),
    path('staff/orders/', staff.StaffOrdersView.as_view(), name='staff-orders'),
    path('staff/orders/<str:reference>/', staff.StaffOrderStatusView.as_view(), name='staff-order-status'),
    path('staff/menu/', staff.StaffMenuView.as_view(), name='staff-menu'),
    path('staff/menu/items/<int:pk>/', staff.StaffMenuItemView.as_view(), name='staff-menu-item'),
    path('staff/customers/', staff.StaffCustomersView.as_view(), name='staff-customers'),
    path('staff/sales/', staff.StaffSalesView.as_view(), name='staff-sales'),
    path('staff/promotions/', staff.StaffPromotionsView.as_view(), name='staff-promotions'),
    path('auth/otp/request/', views.OTPRequestView.as_view(), name='otp-request'),
    path('auth/otp/verify/', views.OTPVerifyView.as_view(), name='otp-verify'),
    path('auth/me/', views.MeView.as_view(), name='customer-me'),
    path('promotions/live/', views.LivePromotionsView.as_view(), name='promotions-live'),
    path('orders/pickup-times/', views.PickupTimesView.as_view(), name='pickup-times'),
    path('orders/quote/', views.QuoteView.as_view(), name='order-quote'),
    path('orders/', views.OrderCreateView.as_view(), name='order-create'),
    path('orders/<str:reference>/', views.OrderDetailView.as_view(), name='order-detail'),
    path('orders/<str:reference>/checkout/', views.OrderCheckoutView.as_view(), name='order-checkout'),
]
