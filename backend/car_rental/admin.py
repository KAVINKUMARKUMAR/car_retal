from django.contrib import admin
from .models import User, Car, Driver, Booking, Payment, Notification

admin.site.register(User)
admin.site.register(Car)
admin.site.register(Driver)
admin.site.register(Booking)
admin.site.register(Payment)
admin.site.register(Notification)
