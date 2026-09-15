import time

from django.conf import settings
from django.contrib import messages
from django.core.mail import EmailMessage
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.shortcuts import redirect, render


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
    contact_email_enabled = bool(
        settings.CONTACT_EMAIL_ENABLED
        and settings.CONTACT_EMAIL_TO
        and settings.DEFAULT_FROM_EMAIL
    )

    context = {
        "contact_email_enabled": contact_email_enabled,
        "contact_form_data": {},
        "contact_form_errors": [],
    }

    if request.method != "POST":
        request.session["contact_form_started_at"] = time.time()
        return render(request, "website/contact.html", context)

    if not contact_email_enabled:
        messages.error(
            request,
            "Online messaging is not available yet. Please call the studio for assistance."
        )
        return redirect("contact")

    email_address = request.POST.get("email", "").strip()
    subject = request.POST.get("subject", "").strip()
    message_body = request.POST.get("message", "").strip()
    honeypot = request.POST.get("website", "").strip()

    context["contact_form_data"] = {
        "email": email_address,
        "subject": subject,
        "message": message_body,
    }

    errors = []

    # Basic bot trap. Real visitors never see or fill this field.
    if honeypot:
        messages.success(request, "Thanks! Your message has been received.")
        return redirect("contact")

    # Reject unrealistically fast submissions.
    started_at = request.session.get("contact_form_started_at")
    try:
        if started_at and time.time() - float(started_at) < settings.CONTACT_EMAIL_MIN_SECONDS:
            errors.append("Please wait a moment before sending your message.")
    except (TypeError, ValueError):
        pass

    # Simple per-session rate limit.
    last_sent_at = request.session.get("contact_last_sent_at")
    try:
        if last_sent_at and time.time() - float(last_sent_at) < settings.CONTACT_EMAIL_RATE_LIMIT_SECONDS:
            errors.append("Please wait before sending another message.")
    except (TypeError, ValueError):
        pass

    if not email_address:
        errors.append("Enter your email address.")
    else:
        try:
            validate_email(email_address)
        except ValidationError:
            errors.append("Enter a valid email address.")

    # Keep the subject single-line to avoid email header injection.
    subject = " ".join(subject.splitlines()).strip()
    context["contact_form_data"]["subject"] = subject

    if not subject:
        errors.append("Enter a subject.")
    elif len(subject) > 120:
        errors.append("The subject must be 120 characters or fewer.")

    if not message_body:
        errors.append("Enter a message.")
    elif len(message_body) > 4000:
        errors.append("The message must be 4,000 characters or fewer.")

    if errors:
        context["contact_form_errors"] = errors
        request.session["contact_form_started_at"] = time.time()
        return render(request, "website/contact.html", context, status=400)

    email_text = (
        "New message from The Dance Place website\n\n"
        f"Reply-to email: {email_address}\n"
        f"Subject: {subject}\n\n"
        "Message:\n"
        f"{message_body}\n"
    )

    email = EmailMessage(
        subject=f"[Dance Place Website] {subject}",
        body=email_text,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[settings.CONTACT_EMAIL_TO],
        reply_to=[email_address],
    )

    try:
        email.send(fail_silently=False)
    except Exception:
        messages.error(
            request,
            "We couldn't send your message right now. Please try again later or call the studio."
        )
        request.session["contact_form_started_at"] = time.time()
        return render(request, "website/contact.html", context, status=503)

    request.session["contact_last_sent_at"] = time.time()
    request.session["contact_form_started_at"] = time.time()

    messages.success(
        request,
        "Your message was sent successfully. The Dance Place will get back to you as soon as possible."
    )
    return redirect("contact")
