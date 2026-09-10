/**
 * IndustryOne - National Industrial Approval System
 * Entrepreneur Portal Login Logic
 */

let currentCaptchaCode = "";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Initialize Captcha
    generateCaptcha();

    // 2. Mobile Menu Toggle
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const mobileMenu = document.getElementById("mobile-menu");

    if (hamburgerBtn && mobileMenu) {
        hamburgerBtn.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");
        });
    }

    // 3. Auto-clear alerts on user typing
    const inputs = document.querySelectorAll("#entrepreneurLoginForm input");
    inputs.forEach((input) => {
        input.addEventListener("input", () => {
            hideAlert();
        });
    });

    // 4. Setup Caps Lock Detection for Government Security
    setupCapsLockDetection();
});

/**
 * Generate a secure 6-character alphanumeric Captcha with visual distortions
 */
function generateCaptcha() {
    const canvas = document.getElementById("captchaCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz"; // Avoid confusing chars like 0/O, 1/l/I
    let code = "";

    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    currentCaptchaCode = code;

    // Canvas styling
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    ctx.fillStyle = "#05132B";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Random noise lines
    for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(212, 169, 76, ${0.15 + Math.random() * 0.25})`;
        ctx.lineWidth = 1 + Math.random();
        ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.stroke();
    }

    // Random noise dots
    for (let i = 0; i < 30; i++) {
        ctx.fillStyle = `rgba(248, 241, 223, ${0.15 + Math.random() * 0.3})`;
        ctx.beginPath();
        ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1, 0, Math.PI * 2);
        ctx.fill();
    }

    // Render each character with slight rotation and offset
    const charSpacing = canvas.width / 7;
    for (let i = 0; i < code.length; i++) {
        ctx.save();
        const x = (i + 0.8) * charSpacing;
        const y = canvas.height / 2 + (Math.random() * 6 - 3);
        const angle = (Math.random() - 0.5) * 0.35; // Slight tilt

        ctx.translate(x, y);
        ctx.rotate(angle);

        // Font variations
        ctx.font = `bold ${20 + Math.floor(Math.random() * 4)}px 'Space Mono', monospace`;

        // Distinct government gold/cream colors
        const colors = ["#F8F1DF", "#D4A94C", "#E5B869", "#819BC2"];
        ctx.fillStyle = colors[i % colors.length];
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Text shadow for legibility
        ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
        ctx.shadowBlur = 3;

        ctx.fillText(code[i], 0, 0);
        ctx.restore();
    }
}

/**
 * Toggle Password Visibility (Eye Icon)
 */
function togglePasswordVisibility() {
    const passwordInput = document.getElementById("enterprisePassword");
    const eyeIcon = document.getElementById("eyeIcon");
    if (!passwordInput || !eyeIcon) return;

    if (passwordInput.type === "password") {
        passwordInput.type = "text";
        // Eye-slash SVG
        eyeIcon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
        `;
    } else {
        passwordInput.type = "password";
        // Standard Eye SVG
        eyeIcon.innerHTML = `
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        `;
    }
}

/**
 * Adjust root font size for portal accessibility
 */
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

/**
 * Form Feedback Alerts
 */
function showAlert(message, type = "error") {
    const alertBox = document.getElementById("feedbackAlert");
    const alertMsg = document.getElementById("alertMessage");
    const alertIcon = document.getElementById("alertIcon");

    if (!alertBox || !alertMsg) return;

    alertBox.className = `feedback-alert ${type}`;
    alertMsg.textContent = message;
    alertIcon.textContent = type === "success" ? "✓" : "⚠️";
    alertBox.classList.remove("hidden");
}

function hideAlert() {
    const alertBox = document.getElementById("feedbackAlert");
    if (alertBox) {
        alertBox.classList.add("hidden");
    }
}

const API_BASE_URL = "http://localhost:8080/api";
let lockTimerInterval = null;

/**
 * Play Audio Captcha for visual accessibility (GIGW / NIC compliance)
 */
function playAudioCaptcha() {
    if (!currentCaptchaCode) return;
    if (!('speechSynthesis' in window)) {
        showAlert("Audio speech synthesis is not supported on this browser.", "error");
        return;
    }
    window.speechSynthesis.cancel();
    const characters = currentCaptchaCode.split("").map(c => {
        if (c >= 'A' && c <= 'Z') return `Capital ${c}`;
        if (c >= 'a' && c <= 'z') return `Small ${c}`;
        return c;
    }).join(", ");
    const utterance = new SpeechSynthesisUtterance(`Captcha verification code is: ${characters}`);
    utterance.rate = 0.75;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
}

/**
 * Toggle Government Password Security Guidelines
 */
function togglePasswordPolicy() {
    const dropdown = document.getElementById("pwdPolicyDropdown");
    if (dropdown) {
        dropdown.classList.toggle("hidden");
    }
}

/**
 * Real-time Caps Lock Detection (standard on Indian Government Portals)
 */
function setupCapsLockDetection() {
    const pwdInput = document.getElementById("enterprisePassword");
    const warning = document.getElementById("capsLockWarning");
    if (!pwdInput || !warning) return;

    const checkCaps = (e) => {
        if (e.getModifierState && e.getModifierState("CapsLock")) {
            warning.classList.remove("hidden");
        } else {
            warning.classList.add("hidden");
        }
    };

    pwdInput.addEventListener("keydown", checkCaps);
    pwdInput.addEventListener("keyup", checkCaps);
    pwdInput.addEventListener("blur", () => warning.classList.add("hidden"));
}

/**
 * Handle Entrepreneur Login Submission & Verification
 */
async function handleEntrepreneurLogin(event) {
    event.preventDefault();

    const identifier = document.getElementById("enterpriseIdentifier")?.value.trim();
    const password = document.getElementById("enterprisePassword")?.value.trim();
    const userCaptcha = document.getElementById("captchaInput")?.value.trim();
    const submitBtn = document.getElementById("submitBtn");

    // 1. Validate Identifier
    if (!identifier) {
        showAlert("Please enter your registered Enterprise Email.");
        document.getElementById("enterpriseIdentifier")?.focus();
        return;
    }

    // 2. Validate Password
    if (!password) {
        showAlert("Please enter your portal password.");
        document.getElementById("enterprisePassword")?.focus();
        return;
    }

    // Government Security Standard Check: Passwords must be at least 8 chars
    if (password.length < 8) {
        showAlert("Statutory Security Requirement: Password must be at least 8 characters (alphanumeric + symbol).", "error");
        document.getElementById("enterprisePassword")?.focus();
        return;
    }

    // 3. Validate Captcha
    if (!userCaptcha) {
        showAlert("Please enter the 6-character security verification code.");
        document.getElementById("captchaInput")?.focus();
        return;
    }

    if (userCaptcha.toLowerCase() !== currentCaptchaCode.toLowerCase()) {
        showAlert("Invalid security captcha code. Please re-enter the code shown.", "error");
        generateCaptcha();
        const captchaInput = document.getElementById("captchaInput");
        if (captchaInput) {
            captchaInput.value = "";
            captchaInput.focus();
        }
        return;
    }

    // 4. Authenticating State
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.75";
        submitBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-[#07152F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Verifying Statutory Authentication...</span>
        `;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: identifier,
                password: password,
                role: "ENTREPRENEUR"
            })
        });

        const data = await response.json().catch(() => ({}));

        if (response.ok && data.success) {
            // Save token and profile to localStorage
            if (data.token) {
                localStorage.setItem("authToken", data.token);
            }

            const rawName = data.fullName || (identifier.includes("@") ? identifier.split("@")[0] : identifier);
            const formattedName = rawName
                .replace(/[._-]/g, " ")
                .replace(/\b\w/g, c => c.toUpperCase());

            const userProfile = {
                token: data.token,
                userId: data.userId,
                email: data.email || identifier,
                name: formattedName || "Applicant User",
                company: formattedName.includes(" ") ? formattedName : `${formattedName} Industrial Solutions LLP`,
                udyam: "UDYAM-MP-08-009124",
                appId: "IND-2026-" + (data.userId || "8942"),
                role: "Verified Applicant",
                loginTime: new Date().toISOString()
            };
            localStorage.setItem("industryOneUser", JSON.stringify(userProfile));

            showAlert(`Verification successful! Welcome back, ${formattedName}. Initializing session...`, "success");

            setTimeout(() => {
                window.location.href = "applicant-dashboard.html";
            }, 900);
            return;
        }

        // Handle specific failure statuses
        if (response.status === 429 || data.locked) {
            // Account Locked
            const seconds = data.retryAfterSeconds || 180;
            const message = data.message || "Too many failed attempts. Account is temporarily locked.";
            startLockCountdown(seconds, message);
            generateCaptcha();
            return;
        }

        if (response.status === 401) {
            // Bad Credentials
            const remaining = data.remainingAttempts !== undefined ? data.remainingAttempts : null;
            const attemptText = remaining !== null ? ` (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)` : "";
            showAlert((data.message || "Invalid email, password or role.") + attemptText, "error");
            generateCaptcha();
            resetSubmitButton();
            return;
        }

        // Generic error
        showAlert(data.message || "Authentication failed. Please verify your credentials.", "error");
        generateCaptcha();
        resetSubmitButton();

    } catch (err) {
        console.error("Authentication request failed:", err);
        showAlert(
            "Unable to connect to the authentication server. Please verify your network connection or try again shortly.",
            "error"
        );
        resetSubmitButton();
        generateCaptcha();
    }
}

/**
 * Handle countdown lockout when max failed attempts reached
 */
function startLockCountdown(totalSeconds, customMessage) {
    if (lockTimerInterval) clearInterval(lockTimerInterval);

    let remaining = totalSeconds;
    const submitBtn = document.getElementById("submitBtn");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = "0.65";
    }

    function renderLockState() {
        if (remaining <= 0) {
            clearInterval(lockTimerInterval);
            showAlert("Lockout period has expired. You may attempt to sign in again.", "success");
            resetSubmitButton();
            return;
        }

        const mins = Math.floor(remaining / 60);
        const secs = remaining % 60;
        const timeStr = mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;

        showAlert(
            (customMessage ? `${customMessage} ` : "Account temporarily locked. ") +
            `Try again in ${timeStr}.`,
            "error"
        );

        if (submitBtn) {
            submitBtn.innerHTML = `<span>Account Locked (${timeStr})</span>`;
        }
        remaining--;
    }

    renderLockState();
    lockTimerInterval = setInterval(renderLockState, 1000);
}

/**
 * Reset submit button to normal state
 */
function resetSubmitButton() {
    const submitBtn = document.getElementById("submitBtn");
    if (!submitBtn) return;

    submitBtn.disabled = false;
    submitBtn.style.opacity = "1";
    submitBtn.innerHTML = `
        <span>Sign In to Industrial Portal</span>
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
    `;
}