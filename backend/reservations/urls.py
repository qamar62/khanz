from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ReservationViewSet,
    ContactMessageViewSet,
    CateringRequestViewSet,
    BranchViewSet
)

router = DefaultRouter()
router.register(r'reservations', ReservationViewSet, basename='reservation')
router.register(r'contacts', ContactMessageViewSet, basename='contact')
router.register(r'catering', CateringRequestViewSet, basename='catering')
router.register(r'branches', BranchViewSet, basename='branch')

urlpatterns = [
    path('', include(router.urls)),
]
