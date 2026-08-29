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
