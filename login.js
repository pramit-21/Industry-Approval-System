document.addEventListener("DOMContentLoaded", () => {
    // --- Mobile Hamburger Menu Toggle ---
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const navMenu = document.getElementById("nav-menu");

    if (hamburgerBtn && navMenu) {
        hamburgerBtn.addEventListener("click", () => {
            navMenu.classList.toggle("hidden");
            navMenu.classList.toggle("flex");
            navMenu.classList.toggle("flex-col");
            navMenu.classList.toggle("absolute");
            navMenu.classList.toggle("top-full");
            navMenu.classList.toggle("left-0");
            navMenu.classList.toggle("w-full");
            navMenu.classList.toggle("bg-[#183D3D]");
            navMenu.classList.toggle("p-4");
            navMenu.classList.toggle("space-y-3");
        });
    }

    // Set default view (Officer)
    showOfficer();
});

// --- Tab Switching Logic ---
const tabs = {
    entrepreneur: {
        btnId: "tabEntrepreneur",
        sectionId: "entrepreneurSection",
        role: "entrepreneur",
        footerText: "New entrepreneur?",
        footerLinkText: "Create new Account",
        footerHref: "EntrepreneurRegister.jsp",
    },
    officer: {
        btnId: "tabOfficer",
        sectionId: "emailSection", // Used as the officer section in your markup
        role: "officer",
        footerText: "New officer?",
        footerLinkText: "Create new Account",
        footerHref: "OfficerRegister.jsp",
    },
    inspector: {
        btnId: "tabInspector",
        sectionId: "inspectorSection",
        role: "inspector",
        footerText: "New inspector?",
        footerLinkText: "Contact Administrator",
        footerHref: "Contact.jsp",
    },
};

function switchRole(selectedRole) {
    const roleConfig = tabs[selectedRole];
    if (!roleConfig) return;

    // 1. Update hidden role input
    const roleInput = document.getElementById("role");
    if (roleInput) roleInput.value = roleConfig.role;

    // 2. Toggle Tab Button Styles
    Object.keys(tabs).forEach((key) => {
        const btn = document.getElementById(tabs[key].btnId);
        if (!btn) return;

        if (key === selectedRole) {
            btn.classList.add("tab-active", "bg-white/20", "text-white", "rounded-full");
            btn.classList.remove("tab-inactive", "text-white/60");
        } else {
            btn.classList.remove("tab-active", "bg-white/20", "text-white", "rounded-full");
            btn.classList.add("tab-inactive", "text-white/60");
        }
    });

    // 3. Show/Hide Form Sections
    const sections = ["emailSection", "inspectorSection", "entrepreneurSection"];
    sections.forEach((id) => {
        const section = document.getElementById(id);
        if (!section) return;

        if (id === roleConfig.sectionId) {
            section.classList.remove("hidden", "hidden-section");
        } else {
            section.classList.add("hidden", "hidden-section");
        }
    });

    // 4. Update Footer Links & Prompts
    const footerText = document.getElementById("footerText");
    const footerLink = document.getElementById("footerLink");

    if (footerText) footerText.textContent = roleConfig.footerText;
    if (footerLink) {
        footerLink.textContent = roleConfig.footerLinkText;
        footerLink.setAttribute("href", roleConfig.footerHref);
    }
}

// Global functions matching your inline onclick handlers
function showEntrepreneur() {
    switchRole("entrepreneur");
}

function showOfficer() {
    switchRole("officer");
}

function showInspector() {
    switchRole("inspector");
}