from django.urls import path
from . import views

urlpatterns = [
    path("", views.home, name="home"),
    path("about/", views.about, name="about"),
    path("meet-our-team/", views.meet_team, name="meet_team"),
    path("programs/", views.programs, name="programs"),
    path("registration/", views.registration, name="registration"),
    path("performances/", views.performances, name="performances"),
    path("calendar/", views.calendar, name="calendar"),
    path("faq/", views.faq, name="faq"),
    path("contact/", views.contact, name="contact"),
]
