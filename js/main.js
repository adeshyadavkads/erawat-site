/**
 * MAIN.JS — Interactive controls for Erawat Pharma Limited
 * Handles mobile navigation, form validation, page loader, and sticky header.
 * No inline CSS manipulation: toggles classes and ARIA attributes only.
 */

(function () {
  "use strict";

  /* ------------------------------------------------------------------------
     1. MOBILE NAVIGATION TOGGLE
     ------------------------------------------------------------------------ */
  function initMobileNav() {
    const toggleBtn = document.getElementById("navToggle");
    const nav = document.getElementById("siteNav");
    if (!toggleBtn || !nav) return;

    function setOpen(isOpen) {
      nav.classList.toggle("is-open", isOpen);
      toggleBtn.setAttribute("aria-expanded", String(isOpen));
    }

    toggleBtn.addEventListener("click", function () {
      const expanded = toggleBtn.getAttribute("aria-expanded") === "true";
      setOpen(!expanded);
    });

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        setOpen(false);
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        setOpen(false);
        toggleBtn.focus();
      }
    });
  }

  /* ------------------------------------------------------------------------
     2. INQUIRY FORM VALIDATION
     ------------------------------------------------------------------------ */
  function initInquiryForm() {
    const form = document.getElementById("inquiryForm");
    const statusBox = document.getElementById("formStatus");
    if (!form || !statusBox) return;

    const recaptchaWidget = document.getElementById("recaptchaWidget");
    const recaptchaCheck = document.getElementById("recaptchaCheck");

    if (recaptchaWidget && recaptchaCheck) {
      recaptchaWidget.addEventListener("click", function (e) {
        if (e.target !== recaptchaCheck && !e.target.closest("label")) {
          recaptchaCheck.checked = !recaptchaCheck.checked;
        }
      });
    }

    const requiredIds = [
      "fullName",
      "companyName",
      "designation",
      "workEmail",
      "country",
      "city",
      "phoneNumber"
    ];

    function setFieldValidity(input, isValid, message) {
      const errorEl = document.getElementById(input.id + "Error");
      input.classList.toggle("is-invalid", !isValid);
      input.setAttribute("aria-invalid", String(!isValid));
      if (errorEl) {
        errorEl.textContent = isValid ? "" : message;
      }
    }

    function validateField(input) {
      const value = input.value.trim();
      if (!value) {
        setFieldValidity(input, false, "This field is required.");
        return false;
      }
      if (input.type === "email") {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          setFieldValidity(input, false, "Enter a valid email address.");
          return false;
        }
      }
      if (input.id === "phoneNumber") {
        const digitsOnly = value.replace(/\D/g, "");
        if (digitsOnly.length < 10) {
          setFieldValidity(input, false, "Enter a valid 10-digit contact number.");
          return false;
        }
      }
      setFieldValidity(input, true, "");
      return true;
    }

    requiredIds.forEach(function (id) {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener("blur", function () {
          validateField(input);
        });
      }
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      let allValid = true;
      let firstInvalid = null;

      requiredIds.forEach(function (id) {
        const input = document.getElementById(id);
        if (input && !validateField(input)) {
          allValid = false;
          if (!firstInvalid) {
            firstInvalid = input;
          }
        }
      });

      if (!allValid) {
        statusBox.classList.add("is-hidden");
        if (firstInvalid) {
          firstInvalid.focus();
        }
        return;
      }

      statusBox.textContent =
        "Thank you! Your inquiry has been sent to Erawat Pharma Limited. Our team will contact you shortly.";
      statusBox.classList.remove("is-hidden");
      form.reset();
    });
  }

  /* ------------------------------------------------------------------------
     3. PAGE LOADER
     ------------------------------------------------------------------------ */
  function initPageLoader() {
    const loader = document.getElementById("pageLoader");
    if (!loader) return;

    // Immediately lock scroll so no background content or scrollbar is interactive/visible
    document.documentElement.classList.add("is-loading");
    document.body.classList.add("is-loading");

    function hideLoader() {
      loader.classList.add("is-hidden");
      loader.setAttribute("aria-hidden", "true");
      document.documentElement.classList.remove("is-loading");
      document.body.classList.remove("is-loading");
      if (typeof AOS !== "undefined") {
        AOS.refresh();
      }
    }

    const prefersReduced =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReduced) {
      hideLoader();
      return;
    }

    const minDisplayMs = 4500; // 4.5 seconds display time (4-5s)
    const startTime = Date.now();

    function scheduleHide() {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayMs - elapsed);
      window.setTimeout(hideLoader, remaining);
    }

    if (document.readyState === "complete") {
      scheduleHide();
    } else {
      window.addEventListener("load", scheduleHide, { once: true });
    }
  }

  /* ------------------------------------------------------------------------
     4. STICKY HEADER SCROLL STATE
     ------------------------------------------------------------------------ */
  function initStickyHeader() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    function updateHeaderState() {
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    }

    window.addEventListener("scroll", updateHeaderState, { passive: true });
    updateHeaderState();
  }

  /* ------------------------------------------------------------------------
     5. HERO SLIDER (CAROUSEL WITH VIDEO & IMAGES)
     ------------------------------------------------------------------------ */
  function initHeroSlider() {
    const slider = document.getElementById("heroSlider");
    if (!slider) return;

    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll(".hero-slider__dot"));
    const prevBtn = document.getElementById("sliderPrevBtn");
    const nextBtn = document.getElementById("sliderNextBtn");

    if (slides.length <= 1) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    const AUTOPLAY_INTERVAL = 6500;
    let autoplayTimer = null;
    let touchStartX = 0;
    let touchStartY = 0;

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function updateSlide(index) {
      currentIndex = (index + totalSlides) % totalSlides;

      slides.forEach(function (slide, i) {
        const isActive = i === currentIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });

      dots.forEach(function (dot, i) {
        const isActive = i === currentIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-selected", String(isActive));
      });

    }

    function nextSlide() {
      updateSlide(currentIndex + 1);
    }

    function prevSlide() {
      updateSlide(currentIndex - 1);
    }

    function startAutoplay() {
      if (prefersReducedMotion) return;
      stopAutoplay();
      autoplayTimer = window.setInterval(nextSlide, AUTOPLAY_INTERVAL);
    }

    function stopAutoplay() {
      if (autoplayTimer) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    }

    function resetAutoplay() {
      stopAutoplay();
      startAutoplay();
    }

    // Button controls
    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        prevSlide();
        resetAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        nextSlide();
        resetAutoplay();
      });
    }

    // Dot indicators
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        const targetIndex = parseInt(dot.getAttribute("data-index"), 10);
        if (!isNaN(targetIndex)) {
          updateSlide(targetIndex);
          resetAutoplay();
        }
      });
    });

    // Pause on hover or focus
    slider.addEventListener("mouseenter", stopAutoplay);
    slider.addEventListener("mouseleave", startAutoplay);
    slider.addEventListener("focusin", stopAutoplay);
    slider.addEventListener("focusout", startAutoplay);

    // Keyboard navigation
    slider.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") {
        prevSlide();
        resetAutoplay();
      } else if (e.key === "ArrowRight") {
        nextSlide();
        resetAutoplay();
      }
    });

    // Touch swipe gestures
    slider.addEventListener(
      "touchstart",
      function (e) {
        if (e.touches && e.touches.length > 0) {
          touchStartX = e.touches[0].clientX;
          touchStartY = e.touches[0].clientY;
        }
      },
      { passive: true }
    );

    slider.addEventListener(
      "touchend",
      function (e) {
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        const diffX = e.changedTouches[0].clientX - touchStartX;
        const diffY = e.changedTouches[0].clientY - touchStartY;

        // If swipe is primarily horizontal and exceeds threshold
        if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY)) {
          if (diffX < 0) {
            nextSlide();
          } else {
            prevSlide();
          }
          resetAutoplay();
        }
      },
      { passive: true }
    );

    // Page visibility change
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        stopAutoplay();
      } else {
        startAutoplay();
      }
    });

    // Initialize state
    updateSlide(0);
    startAutoplay();
  }

  /* ------------------------------------------------------------------------
     6. SEARCH TRIGGER (HEADER SEARCH BUTTON)
     ------------------------------------------------------------------------ */
  function initHeaderSearch() {
    const searchBtn = document.getElementById("headerSearchBtn");
    if (!searchBtn) return;

    searchBtn.addEventListener("click", function () {
      const getStarted = document.getElementById("getStartedSection");
      if (getStarted) {
        getStarted.scrollIntoView({ behavior: "smooth" });
        const input = document.getElementById("fullName");
        if (input) {
          setTimeout(function () {
            input.focus();
          }, 600);
        }
      }
    });
  }

    /* ------------------------------------------------------------------------
     7. FACILITY VIDEO CONTROLLER
     ------------------------------------------------------------------------ */
  function initFacilityVideo() {
    const video = document.getElementById("facilityVideo");
    if (!video) return;

    // Auto-pause video when scrolled off-screen to preserve device performance
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) {
              if (!video.paused) {
                video.pause();
              }
            } else {
              if (video.paused && video.hasAttribute("autoplay")) {
                video.play().catch(function () {});
              }
            }
          });
        },
        { threshold: 0.2 }
      );
      observer.observe(video);
    }
  }

  /* ------------------------------------------------------------------------
     8. AOS (ANIMATE ON SCROLL) INITIALIZATION
     ------------------------------------------------------------------------ */
  function initAOS() {
    if (typeof AOS === "undefined") return;

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    AOS.init({
      duration: 750,
      easing: "ease-out-cubic",
      once: true,
      offset: 70,
      disable: prefersReducedMotion,
    });

    // Refresh AOS when all page assets (images, fonts) finish loading
    window.addEventListener("load", function () {
      if (typeof AOS !== "undefined") {
        AOS.refresh();
      }
    });
  }

  /* ------------------------------------------------------------------------
     9. REUSABLE MODAL & POPUP SYSTEM (P1–P9)
     ------------------------------------------------------------------------ */
  let activeModal = null;
  let lastActiveElement = null;

  function openModal(modalId, triggerEl) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    if (activeModal && activeModal !== modal) {
      closeModal(activeModal);
    }

    lastActiveElement = triggerEl || document.activeElement;
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";
    activeModal = modal;

    // Focus first interactive element or close button
    const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length > 0) {
      focusable[0].focus();
    }
  }

  function closeModal(modal) {
    if (!modal) modal = activeModal;
    if (!modal) return;

    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";

    // Stop video if video modal
    const videoIframe = modal.querySelector("iframe");
    if (videoIframe && videoIframe.dataset.src) {
      videoIframe.src = "";
    }

    if (lastActiveElement && typeof lastActiveElement.focus === "function") {
      lastActiveElement.focus();
    }
    activeModal = null;
  }

  function initModals() {
    // Open triggers
    document.addEventListener("click", function (e) {
      const trigger = e.target.closest("[data-open-modal]");
      if (trigger) {
        e.preventDefault();
        const modalId = trigger.getAttribute("data-open-modal");
        
        // Handle pre-fills (e.g. role for job apply, size for sample)
        const modal = document.getElementById(modalId);
        if (modal) {
          const role = trigger.getAttribute("data-role");
          if (role) {
            const roleEl = modal.querySelector(".modal-role-title");
            if (roleEl) roleEl.textContent = role;
            const roleInput = modal.querySelector("input[name='role']");
            if (roleInput) roleInput.value = role;
          }

          const size = trigger.getAttribute("data-size");
          if (size) {
            const sizeChip = modal.querySelector(".modal-selected-size");
            if (sizeChip) sizeChip.textContent = "Size " + size;
            const sizeInput = modal.querySelector("input[name='size']");
            if (sizeInput) sizeInput.value = size;
          }

          const certTitle = trigger.getAttribute("data-cert-title");
          if (certTitle) {
            const titleEl = modal.querySelector(".modal-cert-title");
            if (titleEl) titleEl.textContent = certTitle;
            const issuerEl = modal.querySelector(".modal-cert-issuer");
            if (issuerEl) issuerEl.textContent = trigger.getAttribute("data-cert-issuer") || "";
          }

          const videoSrc = trigger.getAttribute("data-video-src");
          if (videoSrc) {
            const iframe = modal.querySelector("iframe");
            if (iframe) iframe.src = videoSrc;
          }

          openModal(modalId, trigger);
        }
        return;
      }

      // Close triggers
      if (e.target.closest("[data-close-modal]") || e.target.classList.contains("modal-overlay")) {
        e.preventDefault();
        closeModal();
      }
    });

    // Esc key close
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && activeModal) {
        closeModal();
      }
    });

    // Generic Modal Form Submissions
    const modalForms = document.querySelectorAll(".modal-form");
    modalForms.forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        const statusBox = form.parentElement.querySelector(".modal-success");
        let isValid = true;
        
        const inputs = form.querySelectorAll("input[required], textarea[required]");
        inputs.forEach(function (inp) {
          if (!inp.value.trim()) {
            isValid = false;
            inp.classList.add("is-invalid");
          } else {
            inp.classList.remove("is-invalid");
          }
        });

        if (isValid) {
          form.style.display = "none";
          if (statusBox) {
            statusBox.classList.remove("is-hidden");
            statusBox.style.display = "block";
          }
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     10. INTERACTIVE TABS (GELATIN / HPMC SWITCHER)
     ------------------------------------------------------------------------ */
  function initTabs() {
    const tabContainers = document.querySelectorAll(".type-tabs");
    tabContainers.forEach(function (tabContainer) {
      const buttons = tabContainer.querySelectorAll(".type-tab-btn");
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          buttons.forEach(b => b.classList.remove("is-active"));
          btn.classList.add("is-active");
          const targetTab = btn.getAttribute("data-tab");
          const tabPanels = document.querySelectorAll(".tab-panel");
          tabPanels.forEach(function (panel) {
            if (panel.getAttribute("data-tab-id") === targetTab) {
              panel.classList.remove("is-hidden");
              panel.style.display = "block";
            } else {
              panel.classList.add("is-hidden");
              panel.style.display = "none";
            }
          });
        });
      });
    });
  }

  /* ------------------------------------------------------------------------
     11. COOKIE NOTICE
     ------------------------------------------------------------------------ */
  function initCookieNotice() {
    const notice = document.getElementById("cookieNotice");
    if (!notice) return;
    if (localStorage.getItem("erawat_cookie_accepted") === "true") {
      notice.classList.add("is-hidden");
      return;
    }
    notice.classList.remove("is-hidden");
    const acceptBtn = notice.querySelector("#acceptCookiesBtn");
    if (acceptBtn) {
      acceptBtn.addEventListener("click", function () {
        localStorage.setItem("erawat_cookie_accepted", "true");
        notice.classList.add("is-hidden");
      });
    }
  }

  /* ------------------------------------------------------------------------
     12. SIZE SELECTOR ON PRODUCT DETAIL
     ------------------------------------------------------------------------ */
  function initProductDetailSize() {
    const switcher = document.getElementById("productSizeSwitcher");
    if (!switcher) return;

    // Check URL param ?size=
    const params = new URLSearchParams(window.location.search);
    const sizeParam = params.get("size");

    const specsBySize = {
      "00": { volume: "0.91 ml", capLen: "11.8 mm", bodyLen: "20.2 mm", lockedLen: "23.3 mm", capDia: "8.53 mm", bodyDia: "8.18 mm", weight: "122 mg" },
      "0EL": { volume: "0.78 ml", capLen: "12.0 mm", bodyLen: "21.5 mm", lockedLen: "24.2 mm", capDia: "7.65 mm", bodyDia: "7.34 mm", weight: "108 mg" },
      "0": { volume: "0.68 ml", capLen: "10.9 mm", bodyLen: "18.5 mm", lockedLen: "21.6 mm", capDia: "7.64 mm", bodyDia: "7.33 mm", weight: "96 mg" },
      "1": { volume: "0.50 ml", capLen: "9.8 mm", bodyLen: "16.5 mm", lockedLen: "19.4 mm", capDia: "6.91 mm", bodyDia: "6.63 mm", weight: "76 mg" },
      "2": { volume: "0.37 ml", capLen: "8.9 mm", bodyLen: "15.2 mm", lockedLen: "17.6 mm", capDia: "6.35 mm", bodyDia: "6.07 mm", weight: "61 mg" },
      "3": { volume: "0.30 ml", capLen: "8.0 mm", bodyLen: "13.3 mm", lockedLen: "15.7 mm", capDia: "5.82 mm", bodyDia: "5.57 mm", weight: "48 mg" },
      "4": { volume: "0.21 ml", capLen: "7.2 mm", bodyLen: "12.1 mm", lockedLen: "14.3 mm", capDia: "5.31 mm", bodyDia: "5.05 mm", weight: "38 mg" },
      "5": { volume: "0.13 ml", capLen: "6.2 mm", bodyLen: "9.4 mm", lockedLen: "11.1 mm", capDia: "4.91 mm", bodyDia: "4.68 mm", weight: "28 mg" }
    };

    function updateSizeDisplay(sizeKey) {
      const data = specsBySize[sizeKey];
      if (!data) return;

      const titleEl = document.getElementById("productDetailTitle");
      if (titleEl) titleEl.textContent = "Size " + sizeKey + " Empty Hard Capsule";

      const breadcrumbEl = document.getElementById("productBreadcrumbSize");
      if (breadcrumbEl) breadcrumbEl.textContent = "Size " + sizeKey;

      const volEl = document.getElementById("specVolume");
      if (volEl) volEl.textContent = data.volume;
      const capLenEl = document.getElementById("specCapLen");
      if (capLenEl) capLenEl.textContent = data.capLen;
      const bodyLenEl = document.getElementById("specBodyLen");
      if (bodyLenEl) bodyLenEl.textContent = data.bodyLen;
      const lockedLenEl = document.getElementById("specLockedLen");
      if (lockedLenEl) lockedLenEl.textContent = data.lockedLen;
      const capDiaEl = document.getElementById("specCapDia");
      if (capDiaEl) capDiaEl.textContent = data.capDia;
      const bodyDiaEl = document.getElementById("specBodyDia");
      if (bodyDiaEl) bodyDiaEl.textContent = data.bodyDia;
      const weightEl = document.getElementById("specWeight");
      if (weightEl) weightEl.textContent = data.weight;

      // Update active chip state
      const chips = switcher.querySelectorAll(".size-chip");
      chips.forEach(c => {
        const isActive = c.getAttribute("data-size") === sizeKey;
        c.classList.toggle("is-active", isActive);
      });

      // Update sample button data-size
      const sampleBtn = document.getElementById("productRequestSampleBtn");
      if (sampleBtn) sampleBtn.setAttribute("data-size", sizeKey);
    }

    switcher.addEventListener("click", function (e) {
      const chip = e.target.closest(".size-chip");
      if (chip) {
        e.preventDefault();
        const selectedSize = chip.getAttribute("data-size");
        updateSizeDisplay(selectedSize);
        if (window.history.pushState) {
          const newUrl = window.location.pathname + "?size=" + selectedSize;
          window.history.pushState({ size: selectedSize }, "", newUrl);
        }
      }
    });

    if (sizeParam && specsBySize[sizeParam]) {
      updateSizeDisplay(sizeParam);
    } else {
      updateSizeDisplay("0");
    }
  }

  /* ------------------------------------------------------------------------
     13. INITIALIZATION
     ------------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    initPageLoader();
    initStickyHeader();
    initHeroSlider();
    initFacilityVideo();
    initHeaderSearch();
    initMobileNav();
    initInquiryForm();
    initModals();
    initTabs();
    initCookieNotice();
    initProductDetailSize();
    initAOS();
  });
})();
