from django.urls import path
from .views import (
    UserList, UserDetail, CarList, CarDetail,
    DriverList, DriverDetail, BookingList, BookingDetail,
    PaymentList, PaymentDetail, NotificationList, NotificationDetail,
)

urlpatterns = [
    path('users/', UserList.as_view(), name='user-list'),
    path('users/<int:pk>/', UserDetail.as_view(), name='user-detail'),

    path('cars/', CarList.as_view(), name='car-list'),
    path('cars/<int:pk>/', CarDetail.as_view(), name='car-detail'),

    path('drivers/', DriverList.as_view(), name='driver-list'),
    path('drivers/<int:pk>/', DriverDetail.as_view(), name='driver-detail'),

    path('bookings/', BookingList.as_view(), name='booking-list'),
    path('bookings/<int:pk>/', BookingDetail.as_view(), name='booking-detail'),

    path('payments/', PaymentList.as_view(), name='payment-list'),
    path('payments/<int:pk>/', PaymentDetail.as_view(), name='payment-detail'),

    path('notifications/', NotificationList.as_view(), name='notification-list'),
    path('notifications/<int:pk>/', NotificationDetail.as_view(), name='notification-detail'),
]
