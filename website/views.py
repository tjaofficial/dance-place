from django.shortcuts import render


def home(request):
    return render(request, "website/home.html")


def about(request):
    return render(request, "website/about.html")


def meet_team(request):
    return render(request, "website/meet_team.html")


def programs(request):
    return render(request, "website/programs.html")


def registration(request):
    return render(request, "website/registration.html")


def performances(request):
    return render(request, "website/performances.html")


def calendar(request):
    return render(request, "website/calendar.html")


def faq(request):
    return render(request, "website/faq.html")


def contact(request):
    return render(request, "website/contact.html")
