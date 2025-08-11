from django.db import models
from django.conf import settings
from django.db.models import Q
from django.contrib.auth.models import User
from django.db import models
import uuid

# --- Car Feature Models ---

class CarGroup(models.Model):
    name = models.CharField(max_length=64)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

class CarVariant(models.Model):
    name = models.CharField(max_length=32)  # e.g. Sigma, Zeta
    price_min = models.DecimalField(max_digits=10, decimal_places=2)
    price_max = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name

class CarColor(models.Model):
    name = models.CharField(max_length=50, unique=True)  # e.g., Red
    hex_code = models.CharField(max_length=7, blank=True, help_text="HEX color code like #FFFFFF")

    def __str__(self):
        return self.name

class CarTransmission(models.Model):
    type = models.CharField(max_length=30, unique=True)

    def __str__(self):
        return self.type

class CarFuel(models.Model):
    name = models.CharField(max_length=50, unique=True)  # Petrol, Diesel etc.

    def __str__(self):
        return self.name

class CarFeature(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

# --- Location Models ---

class Location(models.Model):
    name = models.CharField(max_length=255, unique=True)
    address = models.TextField(blank=True, null=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, blank=True, null=True)
    map_url = models.URLField(blank=True, null=True)

    def __str__(self):
        return self.name

    def distance_to(self, user_latitude, user_longitude):
        """
        Calculate great-circle distance (km) from user's coordinates to this Location Using Haversine formula.
        """
        from math import radians, sin, cos, acos

        if self.latitude is None or self.longitude is None:
            return None

        lat1 = radians(float(self.latitude))
        lon1 = radians(float(self.longitude))
        lat2 = radians(user_latitude)
        lon2 = radians(user_longitude)

        # Careful: acos can throw ValueError if argument is out of [-1,1] due to numerical error.
        # Clamp below:
        arg = sin(lat1) * sin(lat2) + cos(lat1) * cos(lat2) * cos(lon2 - lon1)
        arg = max(-1, min(1, arg))  # clamp to [-1, +1]
        distance_km = 6371 * acos(arg)
        return distance_km

# --- Car Models ---

class Car(models.Model):
    name = models.CharField(max_length=128)
    description = models.TextField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    car_type = models.CharField(max_length=12, choices=[("Hatchback", "Hatchback"), ("Sedan", "Sedan"), ("SUV", "SUV")])
    trip_types = models.ManyToManyField('TripType', blank=True, related_name='cars')
    model_year = models.PositiveIntegerField(default=2025)
    group = models.ForeignKey(CarGroup, on_delete=models.SET_NULL, null=True, blank=True)
    variant = models.ForeignKey(CarVariant, on_delete=models.SET_NULL, null=True, blank=True)
    registration_number = models.CharField(max_length=32, blank=True)
    location = models.ForeignKey('Location', on_delete=models.SET_NULL, null=True, blank=True)
    fuel = models.ForeignKey('CarFuel', on_delete=models.SET_NULL, null=True, blank=True, related_name='cars')
    engine = models.CharField(max_length=64)
    mileage = models.CharField(max_length=32)  # "22–30 km/l"
    boot_space = models.CharField(max_length=32, blank=True)
    wheels = models.CharField(max_length=32, blank=True)
    hybrid_tech = models.CharField(max_length=32, blank=True)
    seats = models.PositiveSmallIntegerField(default=5)
    ac = models.BooleanField(default=True)
    color = models.ForeignKey(CarColor, on_delete=models.SET_NULL, null=True, blank=True, related_name="cars")
    transmission = models.ForeignKey(CarTransmission, on_delete=models.SET_NULL, null=True, blank=True, related_name="cars")
    luggage = models.PositiveSmallIntegerField(default=2)
    is_fulfillment_center = models.BooleanField(default=False)  # For "Assured" badge
    features = models.ManyToManyField('CarFeature', blank=True, related_name='cars')
    base_fare = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit_fare = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    unit_fare_after_km = models.PositiveIntegerField(default=10)
    price_per_km_extra = models.DecimalField(max_digits=6, decimal_places=2, default=12)
    insurance = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def __str__(self):
        loc = self.location.name if self.location else ""
        return f'{self.name} {self.model_year} ({loc})'

    @classmethod
    def get_available_cars(cls, rental_data):
        from .models import Booking

        rental_type = rental_data.get('trip_type')
        pickup_location = rental_data.get('pickup_location')
        destination_location = rental_data.get('destination_location')
        drop_location = rental_data.get('drop_location')
        start_datetime = rental_data.get('start_datetime')
        end_datetime = rental_data.get('end_datetime')
        driver_required = rental_data.get('driver_required')
        num_cars = rental_data.get('num_cars', 1)

        cars_qs = cls.objects.all()

        conflicting_bookings = Booking.objects.filter(
            car__in=cars_qs,
            status=Booking.STATUS_CONFIRMED,
        ).filter(
            Q(start_datetime__lte=end_datetime, end_datetime__gte=start_datetime) |
            Q(start_datetime__lte=start_datetime, end_datetime__isnull=True)
        ).values('car_id')

        cars_available = cars_qs.exclude(id__in=conflicting_bookings)

        if rental_type in ['Hourly Rental', 'Outstation Rental', 'One Way', 'Round Trip']:
            cars_available = cars_available.filter(location__name__iexact=pickup_location)
            if rental_type == 'Round Trip':
                if cars_available.count() < num_cars:
                    return cls.objects.none()

        return cars_available

class CarImage(models.Model):
    car = models.ForeignKey('Car', on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='car_images/')
    alt_text = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"Image for {self.car.name}"

class CarDirection(models.Model):
    car = models.OneToOneField('Car', on_delete=models.CASCADE, related_name='direction')
    start_location = models.ForeignKey('Location', on_delete=models.SET_NULL, null=True, blank=True)
    destination_location = models.ForeignKey('Location', related_name='destinations', on_delete=models.SET_NULL, null=True, blank=True)
    google_maps_url = models.URLField(blank=True, null=True)
    # additional fields as needed ...

    def __str__(self):
        return f"Direction info for {self.car.name}"

# --- Add-ons, Promotions, Packages, Offers, Policy ---

class AddOn(models.Model):
    code = models.CharField(max_length=16, unique=True)
    name = models.CharField(max_length=64)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)

    def __str__(self):
        return self.name

class Promotion(models.Model):
    code = models.CharField(max_length=20, unique=True)
    description = models.CharField(max_length=120)
    discount_amount = models.DecimalField(max_digits=8, decimal_places=2)
    is_active = models.BooleanField(default=True)
    valid_from = models.DateTimeField()
    valid_until = models.DateTimeField()

    def __str__(self):
        return self.code

class Review(models.Model):
    car = models.ForeignKey('Car', related_name='reviews', on_delete=models.CASCADE)
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)
    rating = models.PositiveSmallIntegerField()  # 1–5 scale
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.car.name}: {self.rating}'

class TripType(models.Model):
    name = models.CharField(max_length=32)  # e.g. hourly, round_trip, one_way

    def __str__(self):
        return self.name

class Booking(models.Model):
    STATUS_PENDING = 'pending'
    STATUS_CONFIRMED = 'confirmed'
    STATUS_CANCELLED = 'cancelled'
    STATUS_CHOICES = [
        (STATUS_PENDING, 'Pending'),
        (STATUS_CONFIRMED, 'Confirmed'),
        (STATUS_CANCELLED, 'Cancelled'),
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    car = models.ForeignKey('Car', on_delete=models.CASCADE)
    trip_type = models.ForeignKey('TripType', on_delete=models.SET_NULL, null=True)

    # Trip details
    pickup_location = models.CharField(max_length=255, default='Unknown location')
    pickup_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    pickup_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    drop_location = models.CharField(max_length=255, blank=True, null=True)
    drop_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    drop_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    destination_location = models.CharField(max_length=255, blank=True, null=True)
    distance_km = models.PositiveIntegerField(default=0)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField(null=True, blank=True)
    duration_hours = models.PositiveIntegerField(null=True, blank=True)
    num_passengers = models.PositiveIntegerField(null=True, blank=True)
    luggage_count = models.PositiveIntegerField(null=True, blank=True)
    driver_required = models.BooleanField(default=True)
    add_ons = models.ManyToManyField(AddOn, blank=True)
    applied_promotion = models.ForeignKey(Promotion, null=True, blank=True, on_delete=models.SET_NULL)
    fare_estimate = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    final_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    status = models.CharField(max_length=16, choices=STATUS_CHOICES, default=STATUS_PENDING)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Booking #{self.pk} by {self.user} for {self.car}'

    class Meta:
        ordering = ['-created_at']

class Policy(models.Model):
    text = models.CharField(max_length=256)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.text

class Package(models.Model):
    label = models.CharField(max_length=32, unique=True)  # e.g. '4 hr / 40 km'
    hours = models.PositiveIntegerField()
    kms = models.PositiveIntegerField()

    def __str__(self):
        return self.label

class Offer(models.Model):
    code = models.CharField(max_length=20, unique=True)  # e.g. 'CABTRIP'
    desc = models.CharField(max_length=64)  # e.g. '₹200 OFF'
    discount = models.DecimalField(
        max_digits=8, decimal_places=2, blank=True, null=True,
        help_text="Discount amount in rupees; leave blank if not a flat amount."
    )
    percent = models.DecimalField(
        max_digits=5, decimal_places=2, blank=True, null=True,
        help_text="Discount percent (like 5.00 for 5% cashback), if applicable."
    )
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.code} - {self.desc}"
class TempBooking(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    pickup_location = models.CharField(max_length=255)
    destination_location = models.CharField(max_length=255, blank=True, null=True)
    start_datetime = models.DateTimeField()
    end_datetime = models.DateTimeField(blank=True, null=True)
    package = models.CharField(max_length=50, blank=True, null=True)
    driver_required = models.BooleanField(default=True)
    num_days = models.PositiveIntegerField(default=1)
    created_at = models.DateTimeField(auto_now_add=True)