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
     7b. INNER BANNER VIDEO CONTROLLER
     ------------------------------------------------------------------------ */
  function initPageBannerVideo() {
    const video = document.querySelector(".page-banner__video");
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    if (video.hasAttribute("autoplay")) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(function () {});
      }
    }

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
        { threshold: 0.1 }
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
            const certImg = trigger.getAttribute("data-cert-img");
            if (certImg) {
              const imgEl = modal.querySelector(".modal-cert-img, .modal-dialog img");
              if (imgEl) {
                imgEl.src = certImg;
                imgEl.alt = certTitle || "Certificate Preview";
              }
            }
          }

          const videoSrc = trigger.getAttribute("data-video-src");
          if (videoSrc) {
            const iframe = modal.querySelector("iframe");
            if (iframe) {
              iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
              iframe.referrerPolicy = "strict-origin-when-cross-origin";
              iframe.src = videoSrc;
            }
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
     12b. CAREERS ACCORDION & JOIN US APPLICATION FORM
     ------------------------------------------------------------------------ */
  function initCareersAccordionAndForm() {
    const accordionWrap = document.getElementById("careersAccordion");
    if (accordionWrap) {
      const headers = accordionWrap.querySelectorAll(".career-accordion-header");
      headers.forEach(function (header) {
        header.addEventListener("click", function () {
          const isExpanded = header.getAttribute("aria-expanded") === "true";
          const targetId = header.getAttribute("aria-controls");
          const body = document.getElementById(targetId);
          const icon = header.querySelector(".career-accordion-icon");

          // Close other items for clean accordion UX
          headers.forEach(function (otherHeader) {
            if (otherHeader !== header) {
              otherHeader.setAttribute("aria-expanded", "false");
              const otherBody = document.getElementById(otherHeader.getAttribute("aria-controls"));
              if (otherBody) otherBody.hidden = true;
              const otherIcon = otherHeader.querySelector(".career-accordion-icon");
              if (otherIcon) otherIcon.textContent = "+";
            }
          });

          if (isExpanded) {
            header.setAttribute("aria-expanded", "false");
            if (body) body.hidden = true;
            if (icon) icon.textContent = "+";
          } else {
            header.setAttribute("aria-expanded", "true");
            if (body) body.hidden = false;
            if (icon) icon.textContent = "×";
          }
        });
      });
    }

    // Apply Now button click handler
    document.addEventListener("click", function (e) {
      const applyBtn = e.target.closest(".career-apply-btn");
      if (applyBtn) {
        e.preventDefault();
        const role = applyBtn.getAttribute("data-role");
        const functional = applyBtn.getAttribute("data-functional");

        const targetSection = document.getElementById("joinUsSection");
        const funcSelect = document.getElementById("joinFunctionalArea");
        const levelSelect = document.getElementById("joinLevelApplied");
        const firstNameInput = document.getElementById("joinFirstName");
        const joinCard = document.getElementById("joinUsCard");

        if (funcSelect && functional) {
          for (let i = 0; i < funcSelect.options.length; i++) {
            if (funcSelect.options[i].value === functional) {
              funcSelect.selectedIndex = i;
              break;
            }
          }
        }

        if (levelSelect && role) {
          for (let i = 0; i < levelSelect.options.length; i++) {
            if (levelSelect.options[i].value === role) {
              levelSelect.selectedIndex = i;
              break;
            }
          }
        }

        if (targetSection) {
          targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }

        if (joinCard) {
          joinCard.classList.add("is-highlighted");
          setTimeout(function () {
            joinCard.classList.remove("is-highlighted");
          }, 2000);
        }

        if (firstNameInput) {
          setTimeout(function () {
            firstNameInput.focus();
          }, 600);
        }
      }
    });

    // File name display
    const resumeInput = document.getElementById("joinResumeFile");
    const fileNameDisplay = document.getElementById("selectedFileName");
    if (resumeInput && fileNameDisplay) {
      resumeInput.addEventListener("change", function () {
        if (this.files && this.files.length > 0) {
          const file = this.files[0];
          const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
          fileNameDisplay.innerHTML = "<strong>Selected:</strong> " + file.name + " (" + sizeMb + " MB)";
        } else {
          fileNameDisplay.textContent = "";
        }
      });
    }

    // Join Us Form submission
    const joinForm = document.getElementById("joinUsForm");
    const joinStatus = document.getElementById("joinUsFormStatus");
    if (joinForm) {
      joinForm.addEventListener("submit", function (e) {
        e.preventDefault();
        
        let isValid = true;
        const requiredInputs = joinForm.querySelectorAll("[required]");
        requiredInputs.forEach(function (inp) {
          if (!inp.value.trim()) {
            isValid = false;
            inp.classList.add("is-invalid");
          } else {
            inp.classList.remove("is-invalid");
          }
        });

        // Check resume file
        if (resumeInput && (!resumeInput.files || resumeInput.files.length === 0)) {
          isValid = false;
          if (fileNameDisplay) {
            fileNameDisplay.innerHTML = "<span style='color: #dc2626;'>Please select a resume file (PDF, DOC, DOCX).</span>";
          }
        }

        if (!isValid) {
          if (joinStatus) {
            joinStatus.className = "form-status form-status--error";
            joinStatus.textContent = "Please fill in all required fields and upload your resume.";
            joinStatus.classList.remove("is-hidden");
          }
          return;
        }

        const submitBtn = joinForm.querySelector("button[type='submit']");
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Submitting Application...";
        }

        setTimeout(function () {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = "Submit Application &rarr;";
          }
          if (joinStatus) {
            joinStatus.className = "form-status form-status--success";
            joinStatus.innerHTML = "<strong>Thank you for applying!</strong> Your application has been received by the Erawat HR & Technical Recruitment panel. We will review your profile and contact you soon.";
            joinStatus.classList.remove("is-hidden");
          }
          joinForm.reset();
          if (fileNameDisplay) fileNameDisplay.textContent = "";
          joinStatus.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }, 1200);
      });
    }
  }

  /* ------------------------------------------------------------------------
     12c. PRODUCT RANGE SPECS EXPLORER TABS
     ------------------------------------------------------------------------ */
  function initSpecsTabs() {
    const tabBtns = document.querySelectorAll(".specs-tab-btn");
    if (tabBtns.length) {
      tabBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
          const targetTab = btn.getAttribute("data-spec-tab");
          tabBtns.forEach(function (b) {
            b.classList.remove("is-active");
            b.setAttribute("aria-selected", "false");
          });
          btn.classList.add("is-active");
          btn.setAttribute("aria-selected", "true");

          const panels = document.querySelectorAll(".specs-tab-panel");
          panels.forEach(function (p) {
            if (p.getAttribute("data-panel-id") === targetTab) {
              p.classList.add("is-active");
              p.style.display = "block";
            } else {
              p.classList.remove("is-active");
              p.style.display = "none";
            }
          });
        });
      });
    }

    // Diagram links jumping directly to matching tab
    document.addEventListener("click", function (e) {
      const jumpTrigger = e.target.closest("[data-jump-spec-tab]");
      if (jumpTrigger) {
        const tabKey = jumpTrigger.getAttribute("data-jump-spec-tab");
        const matchingBtn = document.querySelector('.specs-tab-btn[data-spec-tab="' + tabKey + '"]');
        if (matchingBtn) {
          matchingBtn.click();
          const targetSection = document.getElementById("specsExplorer");
          if (targetSection) {
            targetSection.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
      }
    });

    // Mobile tap support for flowchart tooltips
    document.addEventListener("click", function (e) {
      const specItem = e.target.closest(".tree-spec-item");
      const tooltipBox = e.target.closest(".tree-box-card-red, .tree-box-card-green-sizes, .tree-box-item--has-tooltip");

      if (!specItem && !tooltipBox) {
        document.querySelectorAll(".tree-spec-item.is-active, .tree-box-card-red.is-tooltip-open, .tree-box-card-green-sizes.is-tooltip-open").forEach(function (el) {
          el.classList.remove("is-active", "is-tooltip-open");
        });
        return;
      }

      if (specItem) {
        const wasActive = specItem.classList.contains("is-active");
        document.querySelectorAll(".tree-spec-item.is-active").forEach(function (el) {
          el.classList.remove("is-active");
        });
        if (!wasActive) specItem.classList.add("is-active");
      }

      if (tooltipBox && !e.target.closest(".tree-link-size")) {
        const wasActive = tooltipBox.classList.contains("is-tooltip-open");
        document.querySelectorAll(".tree-box-card-red.is-tooltip-open, .tree-box-card-green-sizes.is-tooltip-open").forEach(function (el) {
          el.classList.remove("is-tooltip-open");
        });
        if (!wasActive) tooltipBox.classList.add("is-tooltip-open");
      }
    });
  }


  /* ------------------------------------------------------------------------
     13. INITIALIZATION
     ------------------------------------------------------------------------ */
  document.addEventListener("DOMContentLoaded", function () {
    initPageLoader();
    initStickyHeader();
    initHeroSlider();
    initFacilityVideo();
    initPageBannerVideo();
    initHeaderSearch();
    initMobileNav();
    initInquiryForm();
    initModals();
    initTabs();
    initCookieNotice();
    initProductDetailSize();
    initCareersAccordionAndForm();
    initSpecsTabs();
    initAOS();
  });
})();
