from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    CarGroup,
    CarVariant,
    Car,
    AddOn,
    Package,
    Promotion,
    Review,
    TripType,
    Booking,
    Policy,
    Location,
    Offer,
    CarFeature,
    CarFuel,
    CarImage,
    TempBooking,
    CarTransmission
)
from .serializers import CarTransmission


class CarFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarFeature
        fields = ['id', 'name', 'description']

class CarGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarGroup
        fields = ['id', 'name', 'description']


# serializers.py
class LocationSerializer(serializers.ModelSerializer):
    distance_from_user = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = ['name', 'address', 'latitude', 'longitude', 'map_url', 'distance_from_user']

    def get_distance_from_user(self, obj):
        request = self.context.get('request')
        user_lat = request.query_params.get('lat')
        user_lon = request.query_params.get('lng')
        if user_lat and user_lon:
            return round(obj.distance_to(float(user_lat), float(user_lon)), 2)
        return None



class CarVariantSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarVariant
        fields = ['id', 'name', 'price_min', 'price_max']


class AddOnSerializer(serializers.ModelSerializer):
    class Meta:
        model = AddOn
        fields = ['id', 'code', 'name', 'description', 'price']


class CarFuelSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarFuel
        fields = ['id', 'name']



class PromotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Promotion
        fields = ['id', 'code', 'description', 'discount_amount', 'is_active', 'valid_from', 'valid_until']

class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ['id', 'image', 'alt_text']


class CarTransmissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarTransmission
        fields = ['id', 'type']

class CarSerializer(serializers.ModelSerializer):
    group = CarGroupSerializer(read_only=True)
    variant = CarVariantSerializer(read_only=True)
    add_ons = serializers.SerializerMethodField()
    features = serializers.SlugRelatedField(many=True, read_only=True, slug_field='name')
    rating = serializers.SerializerMethodField()
    reviews_count = serializers.SerializerMethodField()
    images = CarImageSerializer(many=True, read_only=True)
    fuel = CarFuelSerializer(read_only=True)
    location = LocationSerializer()
    images = CarImageSerializer(many=True, read_only=True)
    transmission = CarTransmissionSerializer(read_only=True)
    class Meta:
        model = Car
        fields = [
            'id', 'name', 'description','address','car_type', 'model_year','seats', 'ac', 'group', 'variant', 'registration_number', 'location',
            'images', 'engine', 'mileage', 'boot_space', 'wheels', 'hybrid_tech','base_fare',
            'luggage','fuel', 'is_fulfillment_center', 'transmission' ,'features', 'add_ons','tax','insurance','rating', 'reviews_count'
        ]

    def get_add_ons(self, obj):
        # You could filter add-ons by car or location if needed
        return AddOnSerializer(AddOn.objects.all(), many=True).data
    def get_rating(self, obj):
        reviews = obj.reviews.all()
        if not reviews:
            return None
        return round(sum([r.rating for r in reviews]) / len(reviews), 1)

    def get_reviews_count(self, obj):
        return obj.reviews.count()

    def get_image_url(self, obj):
        if obj.image_urls and isinstance(obj.image_urls, list):
            return obj.image_urls[0]
        return None



class ReviewSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    user_initials = serializers.SerializerMethodField()
    class Meta:
        model = Review
        fields = ['id', 'car', 'user', 'rating', 'comment', 'created_at', 'user_initials','rating', 'comment']
    def get_user_initials(self, obj):
        if obj.user and obj.user.first_name and obj.user.last_name:
            return (obj.user.first_name[0] + obj.user.last_name[0]).upper()
        elif obj.user and obj.user.first_name:
            return obj.user.first_name[0].upper()
        return "XX"

class PolicySerializer(serializers.ModelSerializer):
    class Meta:
        model = Policy
        fields = ['id', 'text', 'is_active']


class TripTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TripType
        fields = ['id', 'name']


class BookingSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField(read_only=True)
    car = CarSerializer(read_only=True)
    trip_type = TripTypeSerializer(read_only=True)
    add_ons = AddOnSerializer(many=True, read_only=True)
    applied_promotion = PromotionSerializer(read_only=True)

    class Meta:
        model = Booking
        fields = [
            'id',
            'user',
            'car',
            'trip_type',
            'pickup_location',
            'pickup_lat',
            'pickup_lng',
            'drop_location',
            'drop_lat',
            'drop_lng',
            'destination_location',
            'start_datetime',
            'end_datetime',
            'duration_hours',
            'num_passengers',
            'luggage_count',
            'driver_required',
            'distance_km',
            'add_ons',
            'applied_promotion',
            'fare_estimate',
            'final_price',
            'status',
            'created_at',
        ]


class PackageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Package
        fields = ['id', 'label', 'hours', 'kms']


class OfferSerializer(serializers.ModelSerializer):
    class Meta:
        model = Offer
        fields = ['code', 'desc', 'discount', 'percent', 'is_active']

class TempBookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = TempBooking
        fields = '__all__'