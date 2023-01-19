from pydoc import doc
from tracemalloc import start
from django.contrib.auth import authenticate, login, logout
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.http import HttpResponse, HttpResponseRedirect
from django.db import IntegrityError
from django.shortcuts import render
from platformdirs import user_log_dir
from .models import Schedule, User, Workforce, Booking
from django.http import JsonResponse
from django.core import serializers
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime
import json
from dateutil.parser import parse
from itertools import chain
from django.db.models import Avg
from django.core.mail import send_mail


def index(request):
    return render(request, "capstone/index.html")

# Manage bookings section


@login_required
def bookings(request):
    # Get upcoming bookings
    upcomingBookings = Booking.objects.filter(
        status="upcoming", user_id=request.user).select_related('worker').order_by('start')
    # Get completed bookings
    historyBookings = Booking.objects.filter(
        status="complete", user_id=request.user).select_related('worker').order_by('-start')

    return render(request, "capstone/bookings.html", {"upcomingBookings": upcomingBookings, "historyBookings": historyBookings})


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "capstone/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "capstone/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "capstone/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "capstone/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "capstone/register.html")


# Book a cleaning
@ csrf_exempt
def cleaning(request):

    # Get possible durations to populate the dropdown
    duration = Schedule.objects.values_list('duration', flat=True).distinct()

    return render(request, "capstone/schedule.html", {
        "duration": duration
    })


# Get the distinct available timings for the requested duration
@ csrf_exempt
def schedule(request):
    print('start')
    if request.method == "POST":

        data = json.loads(request.body)
        duration = data['duration']

        schedule = Schedule.objects.filter(
            duration=duration, status="available").distinct().order_by("start")

        structure = serializers.serialize(
            'json', schedule, fields=('start', 'duration'))
        schedule = json.loads(structure)

        return JsonResponse(schedule, safe=False)

    else:
        duration = Schedule.objects.values_list(
            'duration', flat=True).distinct()

        return render(request, "capstone/schedule.html", {
            "duration": duration
        })


# Get the list of workers for the requested timing
@ csrf_exempt
def worker(request):
    if request.method == "POST":

        data = json.loads(request.body)
        duration = data['duration']

        start = data['start']

        start = parse(start)

        workers = Schedule.objects.filter(
            duration=duration, start=start, status="available").values_list('worker_id', flat=True)

        # Get the first and last name of each worker from the workforce table

        workerDetails = Workforce.objects.filter(
            id__in=list(workers))

        # Get the average rating for each worker

        workerDetails = Workforce.objects.filter(
            id__in=list(workers)).annotate(rating=Avg('booking_worker__rating'))

        return JsonResponse([worker.serialize() for worker in workerDetails], safe=False)


# Get all of the checkout data for the last step of the booking
@ csrf_exempt
def checkout(request):

    if request.method == "POST":

        data = json.loads(request.body)
        print(f"body: {data}")
        id = data['id']
        start = data['start']
        start = parse(start)

        worker = Workforce.objects.filter(id=id)

        checkout = Schedule.objects.filter(
            worker_id=id, start=start, status="available")

        checkout = list(chain(worker, checkout))

        structure = serializers.serialize(
            'json', checkout, fields=('worker_id', 'start', 'duration', 'first_name', 'last_name'))
        checkout = json.loads(structure)

        return JsonResponse(checkout, safe=False)


# Finalize the booking by saving the data and sending a confirmation email
@ csrf_exempt
def finalize(request):

    if request.method == "POST" and "rating" not in request.POST:
        print("entered finalize function")
        print(request.body)

        data = json.loads(request.body)
        print(f"body: {data}")
        id = data['id']
        user = data['user']
        print(id)
        print(user)

        # Update the schedule table to busy
        Schedule.objects.filter(id=id).update(status="busy")

        # Create an entry in the booking table

        start = Schedule.objects.filter(id=id).values('start')
        end = Schedule.objects.filter(id=id).values('end')
        worker = Schedule.objects.filter(id=id).values('worker')
        duration = Schedule.objects.filter(id=id).values('duration')

        for duration in duration:
            durationvalue = duration['duration']

        if durationvalue == 2:
            price = 100
        else:
            price = 200

        booking = Booking(user_id=user, category_id=1, start=start, end=end,
                          status="upcoming", price=price, worker_id=worker)

        booking.save()

        # Get the parameters for the email
        start = (start[0]['start'])
        end = (end[0]['end'])
        name = Workforce.objects.filter(
            id=worker[0]['worker']).values('first_name', 'last_name')
        first_name = name[0]['first_name']
        last_name = name[0]['last_name']

        # Send an email confirmation
        send_mail(
            'Your home cleaning booking is confirmed',
            f"Your booking on {start} to {end} with {first_name} {last_name} for {price} AED is confirmed. See you soon!",
            'cleaning@homeservices.com',
            [f'{request.user.email}'],
            fail_silently=False,)

        return HttpResponse("booking successful")


# Rate a booking
@ csrf_exempt
@ login_required
def rate(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    if request.method == "POST":

        data = json.loads(request.body)

        id = data['id']
        rating = data['rating']

        Booking.objects.filter(id=id).update(rating=rating)

        return JsonResponse({"success": "POST updated"}, status=201)
