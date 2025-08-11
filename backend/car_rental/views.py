from rest_framework import viewsets, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.views import APIView
from django.utils.dateparse import parse_datetime
from django.db.models import Q, Avg
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import IsAuthenticated
import uuid
from django_filters.rest_framework import DjangoFilterBackend, FilterSet
from django_filters import NumberFilter, CharFilter, BooleanFilter
from rest_framework.filters import OrderingFilter
from django.shortcuts import get_object_or_404
from django.http import Http404
from .models import (
    Car, Booking, Review, Promotion, Policy, TripType, AddOn, Location, Package, Offer,TempBooking
)
from .serializers import (
    CarSerializer, BookingSerializer, ReviewSerializer,
    PromotionSerializer, PolicySerializer, TripTypeSerializer,
    AddOnSerializer, LocationSerializer, PackageSerializer, OfferSerializer,TempBookingSerializer
)

# --- Car Filter ---
class CarFilter(FilterSet):
    car_type = CharFilter(field_name='car_type', lookup_expr='iexact')
    min_price = NumberFilter(method='filter_min_price')
    max_price = NumberFilter(method='filter_max_price')
    ac = BooleanFilter(field_name='ac')
    seats = NumberFilter(field_name='seats', lookup_expr='gte')

    class Meta:
        model = Car
        fields = ['car_type', 'ac', 'seats', 'min_price', 'max_price']

    def filter_min_price(self, queryset, name, value):
        return queryset.filter(base_fare__gte=value)

    def filter_max_price(self, queryset, name, value):
        return queryset.filter(base_fare__lte=value)

# --- Car API ---
class CarViewSet(viewsets.ModelViewSet):
    queryset = Car.objects.all()
    serializer_class = CarSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]  # DRF's OrderingFilter only
    filterset_class = CarFilter
    ordering_fields = ['base_fare', 'rating']
    permission_classes = [AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        ordering = self.request.query_params.get('ordering')
        if ordering == 'rating':
            qs = qs.annotate(rating_avg=Avg('reviews__rating')).order_by('-rating_avg')
        return qs
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request  # Pass request for distance calculation
        return context
    @action(detail=False, methods=['get'])
    def available(self, request):
        pickup_location = request.query_params.get('pickup_location')
        start_datetime_str = request.query_params.get('start_datetime')
        end_datetime_str = request.query_params.get('end_datetime')

        cars = self.get_queryset()

        if pickup_location:
            cars = cars.filter(location__name__icontains=pickup_location)

        # Check time overlap
        if start_datetime_str and end_datetime_str:
            start_datetime = parse_datetime(start_datetime_str)
            end_datetime = parse_datetime(end_datetime_str)

            if start_datetime and end_datetime:
                overlapping_bookings = Booking.objects.filter(
                    Q(start_datetime__lt=end_datetime) &
                    Q(end_datetime__gt=start_datetime)
                ).values_list('car_id', flat=True)
                cars = cars.exclude(id__in=overlapping_bookings)

        elif start_datetime_str:
            # Fallback: If only start time is given
            start_datetime = parse_datetime(start_datetime_str)
            if start_datetime:
                overlapping_bookings = Booking.objects.filter(
                    Q(start_datetime__lte=start_datetime) &
                    Q(end_datetime__gte=start_datetime)
                ).values_list('car_id', flat=True)
                cars = cars.exclude(id__in=overlapping_bookings)

        serializer = self.get_serializer(cars, many=True)
        return Response(serializer.data)

# --- Booking API ---
class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [IsAuthenticated]  # require login

    def perform_create(self, serializer):
        user = self.request.user
        if not user or not user.is_authenticated:
            raise PermissionDenied("Authentication required to create booking")
        serializer.save(user=user)

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Booking.objects.all()
        if user.is_authenticated:
            return Booking.objects.filter(user=user)
        return Booking.objects.none()

# --- Review API ---
class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        car_id = self.request.query_params.get('car')
        if car_id:
            return self.queryset.filter(car_id=car_id)
        return self.queryset

# --- Promotion API ---
class PromotionViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Promotion.objects.filter(is_active=True)
    serializer_class = PromotionSerializer
    permission_classes = [AllowAny]

    @action(detail=False, methods=['post'])
    def validate_code(self, request):
        code = request.data.get('code', '').upper()
        try:
            promo = Promotion.objects.get(code=code, is_active=True)
            serializer = self.get_serializer(promo)
            return Response({'valid': True, 'promo': serializer.data})
        except Promotion.DoesNotExist:
            return Response({'valid': False, 'error': 'Invalid promo code'}, status=status.HTTP_400_BAD_REQUEST)

# --- Policy API ---
class PolicyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Policy.objects.filter(is_active=True)
    serializer_class = PolicySerializer
    permission_classes = [AllowAny]

# --- TripType API ---
class TripTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TripType.objects.all()
    serializer_class = TripTypeSerializer
    permission_classes = [AllowAny]

# --- AddOn API ---
class AddOnViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AddOn.objects.all()
    serializer_class = AddOnSerializer
    permission_classes = [AllowAny]

# --- Location Search API ---
class LocationSearchAPIView(generics.ListAPIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        query = self.request.query_params.get('search', '').strip()
        if query:
            return self.queryset.filter(name__icontains=query)
        return Location.objects.none()

# --- Package API ---
class PackageViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Package.objects.all()
    serializer_class = PackageSerializer
    permission_classes = [AllowAny]

# --- Offers API ---
class OffersListView(APIView):
    queryset = Offer.objects.all()
    serializer_class = OfferSerializer
    permission_classes = [AllowAny]

    def get(self, request):
        offers = Offer.objects.filter(is_active=True)
        serializer = OfferSerializer(offers, many=True)
        return Response(serializer.data)

# --- Health Check API ---
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Simple health check endpoint."""
    return Response({"status": "ok", "message": "API is healthy."})


class CarImageUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, car_id):
        car = get_object_or_404(Car, id=car_id)
        files = request.FILES.getlist('images')
        for f in files:
            CarImage.objects.create(car=car, image=f)
        return Response({"status": "success"})


@api_view(['POST'])
@permission_classes([AllowAny])  # ✅ This applies AllowAny properly
def create_temp_booking(request):
    serializer = TempBookingSerializer(data=request.data)
    if serializer.is_valid():
        booking = serializer.save()
        # ✅ Return the ID of the saved record, not a random new UUID
        return Response({"temp_id": str(booking.id)}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def get_booking_by_uuid(temp_id):
    import uuid
    from django.http import Http404

    # If temp_id is already a UUID instance, just assign it; else parse.
    if not isinstance(temp_id, uuid.UUID):
        try:
            uuid_obj = uuid.UUID(str(temp_id), version=4)  # or version=None for any UUID
        except ValueError:
            raise Http404("Invalid UUID format")
    else:
        uuid_obj = temp_id  # It's already a UUID, no need to parse

    booking = TempBooking.objects.filter(id=uuid_obj).first()
    if not booking:
        raise Http404("Booking not found")
    return booking



@api_view(['GET'])
@permission_classes([AllowAny])
def get_temp_booking(request, temp_id):
    booking = get_booking_by_uuid(temp_id)
    serializer = TempBookingSerializer(booking)
    return Response(serializer.data)
