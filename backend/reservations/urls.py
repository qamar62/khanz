from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ReservationViewSet,
    ContactMessageViewSet,
    CateringRequestViewSet,
    BranchViewSet,
    MenuDocumentViewSet,
    MenuCategoryViewSet,
    BranchTimeSlotViewSet,
    RestaurantTableViewSet,
    StripeWebhookView,
)

router = DefaultRouter()
router.register(r'reservations', ReservationViewSet, basename='reservation')
router.register(r'contacts', ContactMessageViewSet, basename='contact')
router.register(r'catering', CateringRequestViewSet, basename='catering')
router.register(r'branches', BranchViewSet, basename='branch')
router.register(r'menus', MenuCategoryViewSet, basename='menu')
router.register(r'menu-documents', MenuDocumentViewSet, basename='menu-document')
router.register(r'time-slots', BranchTimeSlotViewSet, basename='time-slot')
router.register(r'tables', RestaurantTableViewSet, basename='table')

urlpatterns = [
    path('payments/stripe/webhook/', StripeWebhookView.as_view(), name='stripe-webhook'),
    path('', include(router.urls)),
]
