from django.contrib import admin
from django.utils.html import format_html
from .models import (
    CarGroup,
    CarVariant,
    Car,
    AddOn,
    Location,
    Promotion,
    Review,
    TripType,
    Booking,
    Policy,
    Package,
    Offer,
    CarImage,
    CarFeature,
)


# Inline admin for CarImage model
class CarImageInline(admin.TabularInline):
    model = CarImage
    extra = 3
    fields = ('image', 'alt_text')
    readonly_fields = []


@admin.register(CarGroup)
class CarGroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name']


@admin.register(CarVariant)
class CarVariantAdmin(admin.ModelAdmin):
    list_display = ['name', 'price_min', 'price_max']
    search_fields = ['name']


@admin.register(Car)
class CarAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'model_year', 'group', 'variant', 'location',
        'seats', 'ac', 'is_fulfillment_center',
    )
    list_filter = [
        'ac', 'group', 'variant', 'is_fulfillment_center', 'seats', 'fuel', 'transmission'
    ]
    search_fields = ['name', 'location__name']
    ordering = ['name', 'model_year']
    readonly_fields = ['image_preview']
    inlines = [CarImageInline]

    def image_preview(self, obj):
        """
        Display first image_url (if set) or first uploaded image (CarImage).
        """
        # You might have an image_urls property/field in your model
        if hasattr(obj, 'image_urls') and obj.image_urls:
            return format_html(
                '<img src="{}" width="150" style="object-fit: contain;"/>',
                obj.image_urls[0]
            )
        # Fall back to first image in CarImage
        if obj.images.exists():
            return format_html(
                '<img src="{}" width="150" style="object-fit: contain;"/>',
                obj.images.first().image.url
            )
        return "-"
    image_preview.short_description = 'Main Image'
    def get_address(self, obj):
        return obj.location.address if obj.location else ""
    get_address.short_description = 'Address'


@admin.register(AddOn)
class AddOnAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'price', 'description']
    search_fields = ['code', 'name']


@admin.register(Promotion)
class PromotionAdmin(admin.ModelAdmin):
    list_display = ['code', 'description', 'discount_amount', 'is_active', 'valid_from', 'valid_until']
    list_filter = ['is_active', 'valid_from', 'valid_until']
    search_fields = ['code', 'description']
    ordering = ['-valid_from']


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['car', 'user', 'rating', 'created_at']
    list_filter = ['rating', 'created_at']
    search_fields = ['car__name', 'user__username', 'comment']


@admin.register(TripType)
class TripTypeAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'user', 'car', 'trip_type', 'start_datetime',
        'end_datetime', 'status', 'created_at'
    ]
    list_filter = ['status', 'trip_type', 'start_datetime', 'end_datetime']
    search_fields = ['user__username', 'car__name']
    ordering = ['-created_at']


@admin.register(Policy)
class PolicyAdmin(admin.ModelAdmin):
    list_display = ['text', 'is_active']
    list_filter = ['is_active']
    search_fields = ['text']


@admin.register(Package)
class PackageAdmin(admin.ModelAdmin):
    list_display = ['label', 'hours', 'kms']
    search_fields = ['label']


@admin.register(Offer)
class OfferAdmin(admin.ModelAdmin):
    list_display = ['code', 'desc', 'discount', 'percent', 'is_active']
    list_filter = ['is_active']
    search_fields = ['code', 'desc']


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ['name', 'address', 'latitude', 'longitude', 'map_url']
    search_fields = ['name', 'address']


@admin.register(CarFeature)
class CarFeatureAdmin(admin.ModelAdmin):
    list_display = ['name', 'description']
    search_fields = ['name', 'description']
