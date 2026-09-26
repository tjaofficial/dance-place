(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const revealItems = document.querySelectorAll('[data-reveal]');
  if (revealItems.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('is-visible'));
    } else {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.14 });

      revealItems.forEach((item) => observer.observe(item));
    }
  }

  const stepCards = document.querySelectorAll('[data-registration-step]');
  if (!reduceMotion) {
    stepCards.forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
        card.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
      });
    });
  }

  const interactiveSurfaces = document.querySelectorAll('[data-pointer-glow]');
  if (!reduceMotion) {
    interactiveSurfaces.forEach((surface) => {
      surface.addEventListener('pointermove', (event) => {
        const rect = surface.getBoundingClientRect();
        surface.style.setProperty('--pointer-x', `${event.clientX - rect.left}px`);
        surface.style.setProperty('--pointer-y', `${event.clientY - rect.top}px`);
      });
    });
  }
})();


(() => {
  const modal = document.querySelector('[data-tuition-modal]');
  if (!modal) return;

  const openers = document.querySelectorAll('[data-tuition-open]');
  const closers = modal.querySelectorAll('[data-tuition-close]');
  const dialog = modal.querySelector('.tuition-modal-dialog');
  let lastFocused = null;

  const openModal = () => {
    lastFocused = document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('tuition-modal-open');
    requestAnimationFrame(() => {
      const closeButton = modal.querySelector('.tuition-modal-close');
      if (closeButton) closeButton.focus();
    });
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('tuition-modal-open');
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  };

  openers.forEach((button) => button.addEventListener('click', openModal));
  closers.forEach((button) => button.addEventListener('click', closeModal));

  document.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('is-open')) return;

    if (event.key === 'Escape') {
      closeModal();
      return;
    }

    if (event.key === 'Tab' && dialog) {
      const focusable = [...dialog.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )].filter((el) => el.offsetParent !== null);

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
})();

(() => {
  const finders = document.querySelectorAll('[data-class-finder]');
  if (!finders.length) return;

  finders.forEach((finder) => {
    const ageInput = finder.querySelector('[data-age-input]');
    const styleSelect = finder.querySelector('[data-style-select]');
    const levelSelect = finder.querySelector('[data-level-select]');
    const levelButtons = [...finder.querySelectorAll('[data-level-button]')];
    const summary = finder.querySelector('[data-class-finder-summary]');
    const action = finder.querySelector('[data-class-finder-button]');
    let selectedLevel = levelSelect?.value || '';

    const getAge = () => {
      if (!ageInput) return null;
      const value = ageInput.value.trim();
      if (!value) return null;
      const age = Number(value);
      return Number.isInteger(age) && age >= 1 && age <= 99 ? age : null;
    };

    const getLevel = () => levelButtons.length ? selectedLevel : (levelSelect?.value || '');

    const updateUI = () => {
      const age = getAge();
      const style = styleSelect?.value || '';
      const level = getLevel();
      const ready = age !== null && Boolean(style);

      if (ageInput) {
        ageInput.classList.toggle('is-valid', age !== null);
        ageInput.classList.toggle('is-invalid', Boolean(ageInput.value.trim()) && age === null);
      }

      if (summary) {
        if (!age && !style) summary.textContent = 'Enter an age and choose a style';
        else if (!age) summary.textContent = `${style} · Enter dancer's age`;
        else if (!style) summary.textContent = `Age ${age} · Choose a dance style`;
        else summary.textContent = `Age ${age} · ${style}${level ? ` · Level ${level}` : ' · Any level'}`;
      }

      if (!action) return;
      action.classList.toggle('is-disabled', !ready);
      action.setAttribute('aria-disabled', String(!ready));

      const baseHref = action.dataset.baseHref || action.getAttribute('href');
      if (!action.dataset.baseHref) action.dataset.baseHref = baseHref;

      if (!ready) {
        action.setAttribute('href', action.dataset.baseHref);
        return;
      }

      const url = new URL(action.dataset.baseHref, window.location.origin);
      url.searchParams.set('age_group', age);
      url.searchParams.set('class_type', style);
      if (level) url.searchParams.set('level', level);
      else url.searchParams.delete('level');
      action.setAttribute('href', `${url.pathname}${url.search}`);
    };

    levelButtons.forEach((button) => {
      button.addEventListener('click', () => {
        selectedLevel = button.dataset.levelButton || '';
        levelButtons.forEach((other) => {
          const selected = other === button;
          other.classList.toggle('is-selected', selected);
          other.setAttribute('aria-pressed', String(selected));
        });
        updateUI();
      });
    });

    ageInput?.addEventListener('input', updateUI);
    ageInput?.addEventListener('change', updateUI);
    styleSelect?.addEventListener('change', updateUI);
    levelSelect?.addEventListener('change', updateUI);
    updateUI();
  });
})();

(() => {
  const photoSlots = document.querySelectorAll('[data-team-photo]');
  if (!photoSlots.length) return;

  photoSlots.forEach((slot) => {
    const src = (slot.dataset.photoSrc || '').trim();
    if (!src) return;

    const image = slot.querySelector('.team-photo-image');
    if (!image) return;

    image.addEventListener('load', () => {
      image.hidden = false;
      slot.classList.add('has-photo');
    }, { once: true });

    image.addEventListener('error', () => {
      image.hidden = true;
      slot.classList.remove('has-photo');
    }, { once: true });

    image.src = src;
  });
})();

(() => {
  const teamCards = [...document.querySelectorAll('.team-grid details.team-member')];
  if (!teamCards.length) return;

  teamCards.forEach((card) => {
    card.addEventListener('toggle', () => {
      if (!card.open || card.classList.contains('team-member-compact')) return;

      teamCards.forEach((otherCard) => {
        if (otherCard !== card && otherCard.open) {
          otherCard.open = false;
        }
      });
    });
  });
})();



(() => {
  const finder = document.querySelector('[data-registration-class-finder]');
  if (!finder) return;

  const ageInput = finder.querySelector('[data-registration-age]');
  const styleSelect = finder.querySelector('[data-registration-style]');
  const levelButtons = [...finder.querySelectorAll('[data-registration-level]')];
  const summary = finder.querySelector('[data-registration-finder-summary]');
  const action = finder.querySelector('[data-registration-finder-button]');

  let selectedLevel = '';

  const getAge = () => {
    if (!ageInput) return null;
    const raw = ageInput.value.trim();
    if (!raw) return null;

    const age = Number(raw);
    if (!Number.isInteger(age) || age < 1 || age > 99) return null;
    return age;
  };

  const updateFinder = () => {
    const age = getAge();
    const style = styleSelect?.value || '';
    const ready = age !== null && Boolean(style);

    if (ageInput) {
      const hasValue = Boolean(ageInput.value.trim());
      ageInput.classList.toggle('is-valid', age !== null);
      ageInput.classList.toggle('is-invalid', hasValue && age === null);
    }

    if (summary) {
      if (!age && !style) {
        summary.textContent = 'Enter an age and choose a style';
      } else if (!age) {
        summary.textContent = `${style} · Enter dancer's age`;
      } else if (!style) {
        summary.textContent = `Age ${age} · Choose a dance style`;
      } else {
        const levelText = selectedLevel ? ` · Level ${selectedLevel}` : ' · Any level';
        summary.textContent = `Age ${age} · ${style}${levelText}`;
      }
    }

    if (!action) return;

    action.classList.toggle('is-disabled', !ready);
    action.setAttribute('aria-disabled', String(!ready));

    const baseHref = action.dataset.baseHref || action.getAttribute('href');
    if (!action.dataset.baseHref) action.dataset.baseHref = baseHref;

    if (!ready) {
      action.setAttribute('href', action.dataset.baseHref);
      return;
    }

    const url = new URL(action.dataset.baseHref, window.location.origin);
    url.searchParams.set('age_group', age);
    url.searchParams.set('class_type', style);

    if (selectedLevel) {
      url.searchParams.set('level', selectedLevel);
    } else {
      url.searchParams.delete('level');
    }

    action.setAttribute('href', `${url.pathname}${url.search}`);
  };

  levelButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectedLevel = button.dataset.registrationLevel || '';

      levelButtons.forEach((other) => {
        const selected = other === button;
        other.classList.toggle('is-selected', selected);
        other.setAttribute('aria-pressed', String(selected));
      });

      updateFinder();
    });
  });

  ageInput?.addEventListener('input', updateFinder);
  ageInput?.addEventListener('change', updateFinder);
  styleSelect?.addEventListener('change', updateFinder);

  updateFinder();
})();



(() => {
  const modal = document.querySelector('[data-program-modal]');
  if (!modal) return;

  const openers = document.querySelectorAll('[data-program-modal-open]');
  const closers = modal.querySelectorAll('[data-program-modal-close]');
  const title = modal.querySelector('[data-program-modal-title]');
  const description = modal.querySelector('[data-program-modal-description]');
  const dialog = modal.querySelector('.registration-program-modal-dialog');
  let lastFocused = null;

  const openModal = (button) => {
    lastFocused = document.activeElement;

    if (title) title.textContent = button.dataset.programTitle || 'Program';
    if (description) description.textContent = button.dataset.programDescription || '';

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('registration-program-modal-open');

    requestAnimationFrame(() => {
      const closeButton = modal.querySelector('.registration-program-modal-close');
      closeButton?.focus();
    });
  };

  const closeModal = () => {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('registration-program-modal-open');
    lastFocused?.focus?.();
  };

  openers.forEach((button) => {
    button.addEventListener('click', () => openModal(button));
  });

  closers.forEach((button) => button.addEventListener('click', closeModal));

  document.addEventListener('keydown', (event) => {
    if (!modal.classList.contains('is-open')) return;

    if (event.key === 'Escape') {
      closeModal();
      return;
    }

    if (event.key === 'Tab' && dialog) {
      const focusable = [...dialog.querySelectorAll(
        'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )].filter((el) => el.offsetParent !== null);

      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
})();



(() => {
  const arrow = document.querySelector('[data-registration-arrow]');
  const flow = document.querySelector('[data-registration-flow]');
  if (!arrow || !flow) return;

  const cards = [...flow.querySelectorAll('[data-registration-step]')];
  const dots = [...arrow.querySelectorAll('[data-registration-arrow-dot]')];
  if (!cards.length || !dots.length) return;

  const positionDots = () => {
    if (window.matchMedia('(max-width: 760px)').matches) return;

    const arrowRect = arrow.getBoundingClientRect();

    dots.forEach((dot, index) => {
      const card = cards[index];
      if (!card) return;

      const cardRect = card.getBoundingClientRect();
      const centerY = cardRect.top + (cardRect.height / 2) - arrowRect.top;
      dot.style.top = `${centerY}px`;
    });
  };

  positionDots();
  window.addEventListener('resize', positionDots);

  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(positionDots);
    cards.forEach((card) => observer.observe(card));
  }

  flow.querySelectorAll('details').forEach((details) => {
    details.addEventListener('toggle', () => requestAnimationFrame(positionDots));
  });
})();

