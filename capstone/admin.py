from django.contrib import admin
from .models import Category, Workforce, Schedule, Booking

# Register your models here.
admin.site.register(Category)
admin.site.register(Workforce)
admin.site.register(Schedule)
admin.site.register(Booking)
