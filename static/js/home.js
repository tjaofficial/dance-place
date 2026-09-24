document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".main-nav a.nav-link");
    const currentYear = document.getElementById("currentYear");

    if (currentYear) {
        currentYear.textContent = new Date().getFullYear();
    }

    const revealElements = document.querySelectorAll(
        ".feature-item, .class-card, .community-content, .community-photo-card, .about-card"
    );

    revealElements.forEach((element) => {
        element.classList.add("reveal");
    });

    if ("IntersectionObserver" in window) {
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    entry.target.classList.add("visible");
                    revealObserver.unobserve(entry.target);
                });
            },
            {
                threshold: 0.1,
            }
        );

        revealElements.forEach((element) => {
            revealObserver.observe(element);
        });

        const sections = document.querySelectorAll("section[id]");

        const sectionObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    const sectionId = entry.target.getAttribute("id");

                    navLinks.forEach((link) => {
                        const href = link.getAttribute("href");

                        if (href && href.startsWith("#")) {
                            link.classList.toggle("active", href === `#${sectionId}`);
                        }
                    });
                });
            },
            {
                rootMargin: "-35% 0px -55% 0px",
            }
        );

        sections.forEach((section) => {
            sectionObserver.observe(section);
        });
    } else {
        revealElements.forEach((element) => {
            element.classList.add("visible");
        });
    }

    const heroVisual = document.querySelector(".hero-visual");

    if (heroVisual && window.innerWidth > 850) {
        window.addEventListener("mousemove", (event) => {
            const x = (event.clientX / window.innerWidth - 0.5) * 10;
            const y = (event.clientY / window.innerHeight - 0.5) * 10;

            heroVisual.style.transform = `translate(${x}px, ${y}px)`;
        });
    }
});



// Community performance photo slideshow
document.addEventListener("DOMContentLoaded", () => {
    const slideshow = document.querySelector("[data-community-slideshow]");
    if (!slideshow) return;

    const slides = [...slideshow.querySelectorAll(".community-photo-slide")];
    const dots = [...slideshow.querySelectorAll(".community-photo-dots span")];
    if (slides.length < 2) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let current = 0;
    let timer = null;

    const showSlide = (index) => {
        slides[current].classList.remove("is-active");
        dots[current]?.classList.remove("is-active");

        current = (index + slides.length) % slides.length;

        slides[current].classList.add("is-active");
        dots[current]?.classList.add("is-active");
    };

    const start = () => {
        if (reduceMotion || timer) return;
        timer = window.setInterval(() => showSlide(current + 1), 4800);
    };

    const stop = () => {
        if (!timer) return;
        window.clearInterval(timer);
        timer = null;
    };

    slideshow.addEventListener("mouseenter", stop);
    slideshow.addEventListener("mouseleave", start);
    slideshow.addEventListener("focusin", stop);
    slideshow.addEventListener("focusout", start);

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) stop();
        else start();
    });

    start();
});
