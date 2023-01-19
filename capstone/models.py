from unicodedata import category
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.forms import DurationField


class User(AbstractUser):
    pass


class Category(models.Model):
    category_name = models.CharField(max_length=50)

    def serialize(self):
        return {
            "id": self.id,
            "category_name": self.category_name

        }


class Workforce(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name="category")

    def serialize(self):
        return {
            "id": self.id,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "category": self.category.serialize(),
            "rating": self.rating

        }


class Schedule(models.Model):
    worker = models.ForeignKey(
        Workforce, on_delete=models.CASCADE, related_name="worker")
    start = models.DateTimeField(auto_now=False)
    end = models.DateTimeField(auto_now=False)
    duration = models.DecimalField(decimal_places=0, max_digits=2)
    status = models.CharField(max_length=10)

    def serialize(self):
        return {
            "id": self.id,
            "worker": self.worker.serialize(),
            "worker_id": self.worker.serialize(),
            "start": self.start.strftime("%b %d %Y, %I:%M %p"),
            "end": self.end.strftime("%b %d %Y, %I:%M %p"),
            "duration": self.duration,
            "status": self.status,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "rating": self.rating

        }


class Booking(models.Model):
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="booking")
    category = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="category")
    start = models.DateTimeField(auto_now_add=False)
    end = models.DateTimeField(auto_now_add=False)
    status = models.CharField(max_length=10)
    price = models.DecimalField(decimal_places=2, max_digits=5)
    worker = models.ForeignKey(
        Workforce, on_delete=models.CASCADE, related_name="booking_worker")
    rating = models.DecimalField(
        decimal_places=0, max_digits=2, blank=True, null=True)

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.serialize(),
            "category": self.category.serialize(),
            "start": self.start.strftime("%b %d %Y, %I:%M %p"),
            "end": self.end.strftime("%b %d %Y, %I:%M %p"),
            "status": self.status,
            "price": self.price,
            "worker": self.worker.serialize(),
            "rating": self.rating
        }
