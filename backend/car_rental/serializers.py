from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Car, Driver, Booking, Payment, Notification

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'is_customer', 'is_admin', 'is_driver', 'phone']

class CarSerializer(serializers.ModelSerializer):
    class Meta:
        model = Car
        fields = '__all__'

class DriverSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Driver
        fields = ['id', 'user', 'license_number', 'phone', 'available']

class BookingSerializer(serializers.ModelSerializer):
    customer = UserSerializer(read_only=True)
    car = CarSerializer(read_only=True)
    driver = DriverSerializer(read_only=True, allow_null=True)
    
    # To create or update booking, accept IDs for foreign keys:
    customer_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.filter(is_customer=True), source='customer', write_only=True)
    car_id = serializers.PrimaryKeyRelatedField(queryset=Car.objects.all(), source='car', write_only=True)
    driver_id = serializers.PrimaryKeyRelatedField(queryset=Driver.objects.all(), source='driver', allow_null=True, required=False, write_only=True)

    class Meta:
        model = Booking
        fields = [
            'id', 'customer', 'car', 'driver', 'start_date', 'end_date',
            'status', 'total_cost', 'customer_id', 'car_id', 'driver_id'
        ]

class PaymentSerializer(serializers.ModelSerializer):
    booking = BookingSerializer(read_only=True)
    booking_id = serializers.PrimaryKeyRelatedField(queryset=Booking.objects.all(), source='booking', write_only=True)

    class Meta:
        model = Payment
        fields = ['id', 'booking', 'booking_id', 'amount', 'status', 'payment_date', 'payment_method']

class NotificationSerializer(serializers.ModelSerializer):
    recipient = UserSerializer(read_only=True)
    recipient_id = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), source='recipient', write_only=True)

    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'recipient_id', 'message', 'sent_at', 'is_read']
