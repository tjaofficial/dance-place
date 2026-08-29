document.addEventListener("DOMContentLoaded", () => {
    const mobileMenuButton = document.getElementById("mobileMenuButton");
    const mainNav = document.getElementById("mainNav");
    const dropdowns = document.querySelectorAll("[data-nav-dropdown]");
    const mobileQuery = window.matchMedia("(max-width: 850px)");

    if (!mobileMenuButton || !mainNav) {
        return;
    }

    const closeDropdowns = () => {
        dropdowns.forEach((dropdown) => {
            dropdown.classList.remove("open");

            const toggle = dropdown.querySelector(".nav-dropdown-toggle");
            if (toggle) {
                toggle.setAttribute("aria-expanded", "false");
            }
        });
    };

    const setMobileMenu = (open) => {
        mainNav.classList.toggle("open", open);
        mobileMenuButton.classList.toggle("open", open);
        mobileMenuButton.setAttribute("aria-expanded", String(open));
        mobileMenuButton.setAttribute(
            "aria-label",
            open ? "Close navigation menu" : "Open navigation menu"
        );
        document.body.classList.toggle("mobile-nav-open", open);

        if (!open) {
            closeDropdowns();
        }
    };

    mobileMenuButton.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const shouldOpen = !mainNav.classList.contains("open");
        setMobileMenu(shouldOpen);
    });

    dropdowns.forEach((dropdown) => {
        const toggle = dropdown.querySelector(".nav-dropdown-toggle");

        if (!toggle) {
            return;
        }

        toggle.addEventListener("click", (event) => {
            if (!mobileQuery.matches) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const shouldOpen = !dropdown.classList.contains("open");

            closeDropdowns();
            dropdown.classList.toggle("open", shouldOpen);
            toggle.setAttribute("aria-expanded", String(shouldOpen));
        });

        dropdown.addEventListener("mouseenter", () => {
            if (!mobileQuery.matches) {
                toggle.setAttribute("aria-expanded", "true");
            }
        });

        dropdown.addEventListener("mouseleave", () => {
            if (!mobileQuery.matches) {
                toggle.setAttribute("aria-expanded", "false");
            }
        });
    });

    mainNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            if (mobileQuery.matches) {
                setMobileMenu(false);
            }
        });
    });

    document.addEventListener("click", (event) => {
        if (!mobileQuery.matches) {
            return;
        }

        if (
            !mainNav.contains(event.target) &&
            !mobileMenuButton.contains(event.target)
        ) {
            setMobileMenu(false);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && mainNav.classList.contains("open")) {
            setMobileMenu(false);
            mobileMenuButton.focus();
        }
    });

    const handleBreakpointChange = () => {
        if (!mobileQuery.matches) {
            setMobileMenu(false);
        }
    };

    if (typeof mobileQuery.addEventListener === "function") {
        mobileQuery.addEventListener("change", handleBreakpointChange);
    } else if (typeof mobileQuery.addListener === "function") {
        mobileQuery.addListener(handleBreakpointChange);
    }
});
