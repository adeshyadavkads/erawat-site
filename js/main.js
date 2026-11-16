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

    function hideLoader() {
      loader.classList.add("is-hidden");
      loader.setAttribute("aria-hidden", "true");
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

    const minDisplayMs = 400;
    const startTime = Date.now();

    function scheduleHide() {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDisplayMs - elapsed);
      window.setTimeout(hideLoader, remaining);
    }

    window.setTimeout(hideLoader, 500);
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
     14. TIER-1 PHARMA INTERACTIVE CAPSULE COMPARATOR
     (Calculates real-time volume, powder fill densities, and dimensions)
     ------------------------------------------------------------------------ */
  function initInteractiveComparator() {
    const comparatorRoot = document.getElementById("capsuleComparator");
    if (!comparatorRoot) return;

    const sizeData = {
      "000": {
        size: "000",
        volume: "1.37",
        closedLen: "26.10",
        capLen: "12.95",
        bodyLen: "22.20",
        capDia: "9.91",
        bodyDia: "9.55",
        f06: "822",
        f08: "1096",
        f10: "1370",
        f12: "1644",
        desc: "Triple Zero — Maximum volumetric capacity for low-density herbal compounds and high-dose nutraceuticals."
      },
      "00EL": {
        size: "00EL",
        volume: "1.02",
        closedLen: "25.30",
        capLen: "12.80",
        bodyLen: "21.80",
        capDia: "8.53",
        bodyDia: "8.18",
        f06: "612",
        f08: "816",
        f10: "1020",
        f12: "1224",
        desc: "Double Zero Extended Length — Enhanced body volume with standard 00 diameter for easy swallowability."
      },
      "00": {
        size: "00",
        volume: "0.91",
        closedLen: "23.30",
        capLen: "11.74",
        bodyLen: "20.22",
        capDia: "8.53",
        bodyDia: "8.18",
        f06: "546",
        f08: "728",
        f10: "910",
        f12: "1092",
        desc: "Double Zero — Global standard for high-dose prescription pharmaceuticals and premium supplements."
      },
      "0EL": {
        size: "0EL",
        volume: "0.78",
        closedLen: "23.50",
        capLen: "11.90",
        bodyLen: "20.20",
        capDia: "7.65",
        bodyDia: "7.34",
        f06: "468",
        f08: "624",
        f10: "780",
        f12: "936",
        desc: "Zero Extended Length — Additional fill capacity without increasing outer capsule diameter."
      },
      "0": {
        size: "0",
        volume: "0.68",
        closedLen: "21.60",
        capLen: "10.72",
        bodyLen: "18.44",
        capDia: "7.65",
        bodyDia: "7.34",
        f06: "408",
        f08: "544",
        f10: "680",
        f12: "816",
        desc: "Size Zero — The most widely prescribed pharmaceutical capsule size worldwide with universal machine compatibility."
      },
      "1": {
        size: "1",
        volume: "0.50",
        closedLen: "19.40",
        capLen: "9.78",
        bodyLen: "16.61",
        capDia: "6.91",
        bodyDia: "6.63",
        f06: "300",
        f08: "400",
        f10: "500",
        f12: "600",
        desc: "Size 1 — Ideal balance between dosage volume and patient compliance for prescription oral solids."
      },
      "2": {
        size: "2",
        volume: "0.37",
        closedLen: "17.60",
        capLen: "8.94",
        bodyLen: "15.27",
        capDia: "6.35",
        bodyDia: "6.07",
        f06: "222",
        f08: "296",
        f10: "370",
        f12: "444",
        desc: "Size 2 — Highly preferred for potent active pharmaceutical ingredients (APIs) and pediatric/geriatric formulations."
      },
      "3": {
        size: "3",
        volume: "0.30",
        closedLen: "15.70",
        capLen: "8.08",
        bodyLen: "13.59",
        capDia: "5.82",
        bodyDia: "5.57",
        f06: "180",
        f08: "240",
        f10: "300",
        f12: "360",
        desc: "Size 3 — Compact capsule engineered for high-potency drugs and combination therapies."
      },
      "4": {
        size: "4",
        volume: "0.21",
        closedLen: "14.30",
        capLen: "7.21",
        bodyLen: "12.19",
        capDia: "5.31",
        bodyDia: "5.05",
        f06: "126",
        f08: "168",
        f10: "210",
        f12: "252",
        desc: "Size 4 — Micro capsule size optimized for clinical trial blinding and pediatric dosages."
      },
      "5": {
        size: "5",
        volume: "0.13",
        closedLen: "11.10",
        capLen: "6.20",
        bodyLen: "9.30",
        capDia: "4.91",
        bodyDia: "4.68",
        f06: "78",
        f08: "104",
        f10: "130",
        f12: "156",
        desc: "Size 5 — Smallest standard capsule size, specialized for ultra-potent micronized API doses."
      }
    };

    const buttons = comparatorRoot.querySelectorAll(".size-pill-btn");
    const sizeDisplay = document.getElementById("compSizeDisplay");
    const volumeDisplay = document.getElementById("compVolumeDisplay");
    const closedLenDisplay = document.getElementById("compClosedLen");
    const capLenDisplay = document.getElementById("compCapLen");
    const bodyLenDisplay = document.getElementById("compBodyLen");
    const capDiaDisplay = document.getElementById("compCapDia");
    const bodyDiaDisplay = document.getElementById("compBodyDia");
    const f06Display = document.getElementById("compFill06");
    const f08Display = document.getElementById("compFill08");
    const f10Display = document.getElementById("compFill10");
    const f12Display = document.getElementById("compFill12");
    const descDisplay = document.getElementById("compDescDisplay");
    const sampleBtn = document.getElementById("compSampleBtn");

    function updateComparator(sz) {
      const d = sizeData[sz] || sizeData["0"];
      if (sizeDisplay) sizeDisplay.textContent = "Size " + d.size;
      if (volumeDisplay) volumeDisplay.textContent = d.volume + " mL Capacity";
      if (closedLenDisplay) closedLenDisplay.textContent = d.closedLen + " mm";
      if (capLenDisplay) capLenDisplay.textContent = d.capLen + " mm";
      if (bodyLenDisplay) bodyLenDisplay.textContent = d.bodyLen + " mm";
      if (capDiaDisplay) capDiaDisplay.textContent = d.capDia + " mm";
      if (bodyDiaDisplay) bodyDiaDisplay.textContent = d.bodyDia + " mm";
      if (f06Display) f06Display.textContent = d.f06 + " mg";
      if (f08Display) f08Display.textContent = d.f08 + " mg";
      if (f10Display) f10Display.textContent = d.f10 + " mg";
      if (f12Display) f12Display.textContent = d.f12 + " mg";
      if (descDisplay) descDisplay.textContent = d.desc;

      if (sampleBtn) {
        sampleBtn.setAttribute("data-sample-size", "Size " + d.size);
        sampleBtn.textContent = "Request Trial Kit for Size " + d.size + " \u2192";
      }

      buttons.forEach(function (btn) {
        if (btn.getAttribute("data-comparator-size") === sz) {
          btn.classList.add("is-active");
          btn.setAttribute("aria-selected", "true");
        } else {
          btn.classList.remove("is-active");
          btn.setAttribute("aria-selected", "false");
        }
      });
    }

    comparatorRoot.addEventListener("click", function (e) {
      const btn = e.target.closest(".size-pill-btn");
      if (btn) {
        const sz = btn.getAttribute("data-comparator-size");
        if (sz && sizeData[sz]) {
          updateComparator(sz);
        }
      }
    });

    // Default to Size 0
    updateComparator("0");
  }

  /* ------------------------------------------------------------------------
     15. POLYMER FORMULATION MATRIX TABS
     ------------------------------------------------------------------------ */
  function initPolymerMatrix() {
    const polymerRoot = document.getElementById("polymerMatrixSection");
    if (!polymerRoot) return;

    const tabs = polymerRoot.querySelectorAll(".polymer-tab-btn");
    const panels = polymerRoot.querySelectorAll(".polymer-panel");

    polymerRoot.addEventListener("click", function (e) {
      const tab = e.target.closest(".polymer-tab-btn");
      if (!tab) return;
      const targetId = tab.getAttribute("data-polymer-target");

      tabs.forEach(function (t) {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      panels.forEach(function (p) {
        p.style.display = "none";
      });

      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      const targetPanel = document.getElementById(targetId);
      if (targetPanel) {
        targetPanel.style.display = "grid";
      }
    });
  }

  /* ------------------------------------------------------------------------
     16. INITIALIZATION
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
    initInteractiveComparator();
    initPolymerMatrix();
    initAOS();
  });
})();
