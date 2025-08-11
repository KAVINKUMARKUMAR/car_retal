from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LocationSearchAPIView
from . import views
from .views import (
    CarViewSet,
    BookingViewSet,
    ReviewViewSet,
    PromotionViewSet,
    PolicyViewSet,
    TripTypeViewSet,
    AddOnViewSet,
    health_check,
    PackageViewSet,
    OffersListView
)

router = DefaultRouter()
router.register(r'cars', CarViewSet, basename='car')
router.register(r'bookings', BookingViewSet, basename='booking')
router.register(r'reviews', ReviewViewSet, basename='review')
router.register(r'promotions', PromotionViewSet, basename='promotion')
router.register(r'policies', PolicyViewSet, basename='policy')
router.register(r'triptypes', TripTypeViewSet, basename='triptype')
router.register(r'addons', AddOnViewSet, basename='addon')
router.register(r'packages', PackageViewSet, basename='package')

urlpatterns = [
    path('health/', health_check, name='health-check'),
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    path('locations/', LocationSearchAPIView.as_view(), name='location-search'),
    path('offers/', OffersListView.as_view(), name='offers-list'),
    path('booking-temp/', views.create_temp_booking, name='create_temp_booking'),
    path('booking-temp/<uuid:temp_id>/', views.get_temp_booking, name='get_temp_booking'),
]
