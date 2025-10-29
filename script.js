/* script.js – Multi‑step Form (Frontend Mentor) */

(() => {
  // -------------------------------------------------
  // 1. DOM references
  // -------------------------------------------------
  const form = document.getElementById("multiStepForm");
  const steps = document.querySelectorAll(".step");
  const stepItems = document.querySelectorAll(".step-item");
  const nextBtns = document.querySelectorAll(".btn-next");
  const backBtns = document.querySelectorAll(".btn-back");
  const confirmBtn = document.querySelector(".btn-confirm");
  const billingToggle = document.getElementById("billingToggle");

  // Step‑specific elements
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const phoneInput = document.getElementById("phone");

  const planRadios = document.querySelectorAll('input[name="plan"]');
  const addonCheckboxes = document.querySelectorAll('input[type="checkbox"]');

  const summaryPlan = document.querySelector(".summary-item h4");
  const summaryPlanPrice = document.querySelector(".summary-price");
  const changePlanLink = document.querySelector(".change-plan");
  const addonsContainer = document.querySelector(".summary-addons");
  const totalLabel = document.querySelector(".total span:first-child");
  const totalPrice = document.querySelector(".total-price");

  // -------------------------------------------------
  // 2. State
  // -------------------------------------------------
  let currentStep = 0; // 0‑based index
  let isYearly = false; // billing toggle
  const formData = {
    name: "",
    email: "",
    phone: "",
    plan: "arcade", // default
    addons: [], // array of values
  };

  // -------------------------------------------------
  // 3. Pricing tables (monthly / yearly)
  // -------------------------------------------------
  const PRICES = {
    arcade: { mo: 9, yr: 90 },
    advanced: { mo: 12, yr: 120 },
    pro: { mo: 15, yr: 150 },
  };
  const ADDON_PRICES = {
    "online-service": { mo: 1, yr: 10 },
    "larger-storage": { mo: 2, yr: 20 },
    "customizable-profile": { mo: 2, yr: 20 },
  };

  // -------------------------------------------------
  // 4. Helper functions
  // -------------------------------------------------
  const setStep = (idx) => {
    steps.forEach((s, i) => s.classList.toggle("active", i === idx));
    stepItems.forEach((s, i) => s.classList.toggle("active", i === idx));
    currentStep = idx;
  };

  function updateVisiblePrices() {
    const suffixMo = "/mo";
    const suffixYr = "/yr";

    // ---- PLAN CARDS ----
    document.querySelectorAll(".plan-card").forEach((card) => {
      const plan = card.dataset.plan;
      const moSpan = card.querySelector(".monthly-price");
      const yrSpan = card.querySelector(".yearly-price");

      moSpan.textContent = `$${PRICES[plan].mo}${suffixMo}`;
      yrSpan.textContent = `$${PRICES[plan].yr}${suffixYr}`;
    });

    // ---- ADD‑ON CARDS ----
    document.querySelectorAll(".addon-card").forEach((card) => {
      const addon = card.querySelector("input").value;
      const moSpan = card.querySelector(".monthly-price");
      const yrSpan = card.querySelector(".yearly-price");

      moSpan.textContent = `+$${ADDON_PRICES[addon].mo}${suffixMo}`;
      yrSpan.textContent = `+$${ADDON_PRICES[addon].yr}${suffixYr}`;
    });
  }

  const showError = (input, msg) => {
    const field = input.parentElement;
    const errEl = field.querySelector(".error-message");
    input.classList.add("invalid");
    errEl.textContent = msg;
    errEl.style.display = "block";
  };
  const clearError = (input) => {
    const field = input.parentElement;
    const errEl = field.querySelector(".error-message");
    input.classList.remove("invalid");
    errEl.style.display = "none";
  };

  const validateStep1 = () => {
    let valid = true;

    // Name
    if (!nameInput.value.trim()) {
      showError(nameInput, "This field is required");
      valid = false;
    } else if (!/^[A-Za-z\s]+$/.test(nameInput.value.trim())) {
      showError(nameInput, "Name can only contain letters");
      valid = false;
    } else clearError(nameInput);

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
      showError(emailInput, "This field is required");
      valid = false;
    } else if (!emailRegex.test(emailInput.value.trim())) {
      showError(emailInput, "Please enter a valid email");
      valid = false;
    } else clearError(emailInput);

    // Phone (simple: at least 10 digits, allow +, spaces, -)
    const phoneClean = phoneInput.value.replace(/[\s\-\(\)]/g, "");
    if (!phoneInput.value.trim()) {
      showError(phoneInput, "This field is required");
      valid = false;
    } else if (!/^\+?\d{10,}$/.test(phoneClean)) {
      showError(phoneInput, "Please enter a valid phone number");
      valid = false;
    } else clearError(phoneInput);

    if (valid) {
      formData.name = nameInput.value.trim();
      formData.email = emailInput.value.trim();
      formData.phone = phoneInput.value.trim();
    }
    return valid;
  };

  const updatePlanPrices = () => {
    document.querySelectorAll(".plan-card .price").forEach((p) => {
      const plan = p.closest(".plan-card").querySelector("input").value;
      const price = isYearly ? PRICES[plan].yr : PRICES[plan].mo;
      const suffix = isYearly ? "/yr" : "/mo";
      p.textContent = `$${price}${suffix}`;
    });

    document.querySelectorAll(".addon-price").forEach((a) => {
      const addon = a.closest(".addon-card").querySelector("input").value;
      const price = isYearly ? ADDON_PRICES[addon].yr : ADDON_PRICES[addon].mo;
      const suffix = isYearly ? "/yr" : "/mo";
      a.textContent = `+$${price}${suffix}`;
    });
  };

  const updateSummary = () => {
    const planInfo = PRICES[formData.plan];
    const planPrice = isYearly ? planInfo.yr : planInfo.mo;
    const suffix = isYearly ? "/yr" : "/mo";
    const billingText = isYearly ? "Yearly" : "Monthly";

    summaryPlan.textContent = `${capitalize(formData.plan)} (${billingText})`;
    summaryPlanPrice.textContent = `$${planPrice}${suffix}`;

    // Add‑ons
    addonsContainer.innerHTML = "";
    let addonsTotal = 0;
    formData.addons.forEach((id) => {
      const addon = ADDON_PRICES[id];
      const price = isYearly ? addon.yr : addon.mo;
      addonsTotal += price;

      const p = document.createElement("p");
      const name = id.replace(/-/g, " ");
      p.innerHTML = `<span>${capitalize(
        name
      )}</span><span>+$${price}${suffix}</span>`;
      addonsContainer.appendChild(p);
    });

    // Total
    const total = planPrice + addonsTotal;
    totalLabel.textContent = `Total (per ${isYearly ? "year" : "month"})`;
    totalPrice.textContent = `+$${total}${suffix}`;
  };

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

  // -------------------------------------------------
  // 5. Event listeners
  // -------------------------------------------------
  // Next buttons
  nextBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Step 1 validation
      if (currentStep === 0 && !validateStep1()) return;

      // Save plan selection
      if (currentStep === 1) {
        const selected = document.querySelector('input[name="plan"]:checked');
        if (selected) formData.plan = selected.value;
      }

      // Save add‑ons
      if (currentStep === 2) {
        formData.addons = Array.from(addonCheckboxes)
          .filter((cb) => cb.checked)
          .map((cb) => cb.value);
      }

      if (currentStep < steps.length - 2) {
        setStep(currentStep + 1);
        if (currentStep + 1 === 3) updateSummary(); // summary step
      }
    });
  });

  // Back buttons
  backBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (currentStep > 0) setStep(currentStep - 1);
    });
  });

  // Billing toggle
  billingToggle.addEventListener("change", (e) => {
    isYearly = e.target.checked;
    document.body.classList.toggle("billing-yearly", isYearly);
    updateVisiblePrices(); // <-- NEW
    if (currentStep === 3) updateSummary();
  });

  // Plan radio visual feedback
  planRadios.forEach((r) => {
    r.addEventListener("change", () => {
      document.querySelectorAll(".plan-card").forEach((card) => {
        card.classList.toggle("selected", card.querySelector("input").checked);
      });
      if (currentStep === 3) updateSummary();
    });
  });

  // Add‑on visual feedback
  addonCheckboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      const card = cb.closest(".addon-card");
      card.classList.toggle("selected", cb.checked);
      if (currentStep === 3) updateSummary();
    });
  });

  // Change plan link (go back to step 2)
  changePlanLink.addEventListener("click", (e) => {
    e.preventDefault();
    setStep(1);
  });

  // Confirm button – show thank you
  confirmBtn.addEventListener("click", (e) => {
    e.preventDefault();
    setStep(4); // confirmation step
    console.log("Submitted data:", formData);
  });

  // -------------------------------------------------
  // 6. Initialisation
  // -------------------------------------------------
  setStep(0);
  updatePlanPrices();

  // Real‑time validation for step 1
  [nameInput, emailInput, phoneInput].forEach((input) => {
    input.addEventListener("input", () => {
      if (input.classList.contains("invalid")) {
        // Re‑validate only the changed field
        if (input === nameInput) {
          if (
            nameInput.value.trim() &&
            /^[A-Za-z\s]+$/.test(nameInput.value.trim())
          )
            clearError(nameInput);
        }
        if (input === emailInput) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (
            emailInput.value.trim() &&
            emailRegex.test(emailInput.value.trim())
          )
            clearError(emailInput);
        }
        if (input === phoneInput) {
          const clean = phoneInput.value.replace(/[\s\-\(\)]/g, "");
          if (phoneInput.value.trim() && /^\+?\d{10,}$/.test(clean))
            clearError(phoneInput);
        }
      }
    });
  });
})();
