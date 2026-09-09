/**
 * IndustryOne - Officer Registration Controller
 * National Single Window Industrial Clearance System
 */

// Mobile Navigation Toggle
function toggleMobileMenu() {
    const mobileMenu = document.getElementById("mobile-menu");
    if (mobileMenu) {
        mobileMenu.classList.toggle("hidden");
    }
}

// Accessibility Font Size Adjuster
let currentFontSizeLevel = 0;
function adjustFontSize(delta) {
    const root = document.documentElement;
    if (delta === 0) {
        currentFontSizeLevel = 0;
        root.style.fontSize = "16px";
    } else {
        currentFontSizeLevel += delta;
        if (currentFontSizeLevel > 2) currentFontSizeLevel = 2;
        if (currentFontSizeLevel < -1) currentFontSizeLevel = -1;

        const sizeMap = {
            "-1": "14.5px",
            "0": "16px",
            "1": "17.5px",
            "2": "19px"
        };
        root.style.fontSize = sizeMap[currentFontSizeLevel] || "16px";
    }
}

// Password Visibility Toggle
function togglePasswordVisibility(inputId = "password", iconId = "eyeIcon") {
    const pwdInput = document.getElementById(inputId);
    const eyeIcon = document.getElementById(iconId);

    if (!pwdInput) return;

    if (pwdInput.type === "password") {
        pwdInput.type = "text";
        if (eyeIcon) {
            eyeIcon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
            `;
        }
    } else {
        pwdInput.type = "password";
        if (eyeIcon) {
            eyeIcon.innerHTML = `
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            `;
        }
    }
}

// Utility: Email Validator
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Utility: Phone Validator
function isValidPhone(phone) {
    const digits = phone.replace(/\D/g, "");
    return digits.length >= 10;
}

// Clear error state for a field
function clearError(fieldId) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}-error`);

    if (input) {
        input.classList.remove("has-error");
    }
    if (errorEl) {
        errorEl.classList.remove("show");
    }
}

// Show error state for a field
function showError(fieldId, customMessage) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(`${fieldId}-error`);

    if (input) {
        input.classList.add("has-error");
    }
    if (errorEl) {
        if (customMessage) {
            errorEl.textContent = customMessage;
        }
        errorEl.classList.add("show");
    }
}

// Setup real-time input listeners to clear errors on typing
document.addEventListener("DOMContentLoaded", () => {
    const fields = [
        "fullName",
        "email",
        "mobile",
        "password",
        "employeeId",
        "department",
        "licenceType",
        "officeAddress"
    ];

    fields.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", () => clearError(id));
            el.addEventListener("change", () => clearError(id));
        }
    });
});

// Form Submission Handler
function handleOfficerRegistration(event) {
    if (event) event.preventDefault();

    const fullName = document.getElementById("fullName")?.value.trim() || "";
    const email = document.getElementById("email")?.value.trim() || "";
    const mobile = document.getElementById("mobile")?.value.trim() || "";
    const password = document.getElementById("password")?.value || "";
    const employeeId = document.getElementById("employeeId")?.value.trim() || "";
    const departmentSelect = document.getElementById("department");
    const departmentVal = departmentSelect?.value || "";
    const departmentText = departmentSelect?.options[departmentSelect.selectedIndex]?.text || "";
    const licenceType = document.getElementById("licenceType")?.value.trim() || "";
    const officeAddress = document.getElementById("officeAddress")?.value.trim() || "";
    const submitBtn = document.getElementById("submitBtn");

    let hasErrors = false;
    let firstErrorField = null;

    // Validate Full Name
    if (!fullName || fullName.length < 3) {
        showError("fullName", "Please enter your full legal name (minimum 3 characters).");
        hasErrors = true;
        if (!firstErrorField) firstErrorField = "fullName";
    }

    // Validate Email
    if (!email || !isValidEmail(email)) {
        showError("email", "Please enter a valid official government or institutional email address.");
        hasErrors = true;
        if (!firstErrorField) firstErrorField = "email";
    }

    // Validate Mobile
    if (!mobile || !isValidPhone(mobile)) {
        showError("mobile", "Please enter a valid 10-digit mobile number for statutory OTP verification.");
        hasErrors = true;
        if (!firstErrorField) firstErrorField = "mobile";
    }

    // Validate Password
    if (!password || password.length < 8) {
        showError("password", "Password must contain at least 8 characters.");
        hasErrors = true;
        if (!firstErrorField) firstErrorField = "password";
    }

    // Validate Officer ID
    if (!employeeId || employeeId.length < 3) {
        showError("employeeId", "Please enter your official Officer or Employee ID.");
        hasErrors = true;
        if (!firstErrorField) firstErrorField = "employeeId";
    }

    // Validate Department
    if (!departmentVal) {
        showError("department", "Please select your regulatory department authority.");
        hasErrors = true;
        if (!firstErrorField) firstErrorField = "department";
    }

    // Validate Licence Type
    if (!licenceType || licenceType.length < 3) {
        showError("licenceType", "Please specify your clearance desk or licence category.");
        hasErrors = true;
        if (!firstErrorField) firstErrorField = "licenceType";
    }

    // Validate Office Address
    if (!officeAddress || officeAddress.length < 6) {
        showError("officeAddress", "Please enter complete official office address details.");
        hasErrors = true;
        if (!firstErrorField) firstErrorField = "officeAddress";
    }

    if (hasErrors) {
        document.getElementById(firstErrorField)?.focus();
        return;
    }

    // Processing animation
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Recording Official Credentials...
        `;
    }

    // Simulate verification logging & show confirmation
    setTimeout(() => {
        // Generate random Application reference number
        const randomRef = "REG-IO-" + Math.floor(100000 + Math.random() * 900000);

        const summaryName = document.getElementById("summaryName");
        const summaryEmail = document.getElementById("summaryEmail");
        const summaryDept = document.getElementById("summaryDept");
        const summaryAppId = document.getElementById("summaryAppId");

        if (summaryName) summaryName.textContent = fullName;
        if (summaryEmail) summaryEmail.textContent = email;
        if (summaryDept) summaryDept.textContent = departmentText;
        if (summaryAppId) summaryAppId.textContent = randomRef;

        const formSection = document.getElementById("form-section");
        const confirmWrap = document.getElementById("confirm-wrap");

        if (formSection) formSection.classList.add("hidden");
        if (confirmWrap) {
            confirmWrap.classList.remove("hidden");
            confirmWrap.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, 1000);
}
