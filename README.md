# Appointment Booking Web Application - capstone project

The purpose of this web application is to allow users to book home services, utilizing Django and Javascript. Features include:

- Login / Register for an account
- Homepage for selecting a service
- Single Page Application for : Selecting a duration, selecting a time/date, selecting a service provider, confirming the booking 
- Viewing upcoming and historical bookings
- Rating the service for historical bookings
- Sending an email confirmation to the user upon booking


**Distinctiveness and Complexity**
---------------------------------------------------------------------------
This application is distinct from the projects in the course because from a functionality perspective the main feature is to create a booking scheduling service, which was not covered in the course projects and also requires more complex queries than what was required in the projects.

It is also a single page application, which was briefly covered in the lectures but not required in any of the projects, so handling the web history using javascript created additional complexity.

The application also has an email confirmation feature, which is provided through a Django module but was not covered in the course or any course project.

**Functionality Explanation**
-----------------------------
**Booking SPA:**
The booking flow is a single page application which is using Javascript to update the view in each step of the process. The first step of the flow is to select a duration for the booking from a dropdown, which is dynamically populated based on available durations in the Schedule table. The next step queries the Schedule table and returns all unique time slots where the status is marked as available. The following step joins the Workforce and Booking tables to return details (name and average rating) of the available workers for the selected time slot. The progress of the steps is also captured in a sticky bar at the bottom of the page. Finally on the last step, the user can view all of their selections from the booking process and click the Book button to create a booking in the Bookings table, which they also can view in the Manage Bookings section of the application. The Javascript History API is used in order to use the browser back button to view a previous step.

For a logged out user, they will see a reminder on each step of the booking flow to log in, until they reach the final step and the entire summary is hidden, blocking them from completing the booking without logging in. This was accomplished by using the django template tag to check if the user is logged in, and if not, using javascript to inject the "login required" message onto the page. Ideally, the application could save their progress via a cookie and take them back to the final step once they log in, but this functionality was out of scope for the project.

**Manage Bookings:**
Logged in users will see a "Manage Bookings" section in the menu bar, where they can view their Upcoming and Completed bookings and rate their completed bookings. The tabbed design on this page was taken from https://www.w3schools.com/howto/howto_js_tabs.asp, and django queries return the list and details for a user's upcoming and completed bookings. 


**Ratings:**
The ratings feature is available for logged in users. For historical bookings that have not been rated, the user will see a button to rate the booking. Clicking the button will use Javascript to replace the button with a form for the user to select a rating, which is then sent as a json object to django in order to update the booking table with the rating value. The UI on the form then is updated again through javascript to hide the form and reflect the rating without having to reload the page.


**Email Confirmation:**
Using the Django email module (django.core.mail), an email function is added to the final step of the booking process in the SPA. For development purposes, the Console Backend feature in Django was used, so that you can see the email printed out in the console rather than sending real emails. An auth user and password could be set up if the application was to go live.

-----------------------------------------
**Files**

Aside from the standard Django project files that get created by default, the project includes:

static/capstone folder - contains images, styles.css for styling html, and capstone.js which contains all of the javascript functionality
templates/capstone folder - contains the html templates

**How to Run**
Run python3 manage.py runserver
