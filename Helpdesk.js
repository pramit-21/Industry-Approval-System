/**
 * IndustryOne - Central Helpdesk & Grievance Redressal Controller
 * National Single Window Industrial Clearance System
 */

// 1. Mobile Menu Toggle
function toggleMobileMenu() {
    const menu = document.getElementById("mobile-menu");
    if (menu) menu.classList.toggle("hidden");
}

// 2. Accessibility Font Sizing
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

// 3. Category Selector
function setCategory(btn, cat) {
    document.querySelectorAll(".category-pill").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    const catInput = document.getElementById("selectedCategory");
    if (catInput) catInput.value = cat;
}

// 4. Priority Selector
function setPriority(btn, priority) {
    document.querySelectorAll(".priority-pill").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    const priInput = document.getElementById("selectedPriority");
    if (priInput) priInput.value = priority;
}

// 5. FAQ Accordion Toggle
function toggleFaq(header) {
    const item = header.parentElement;
    const isOpen = item.classList.contains("open");
    // Close other FAQs
    document.querySelectorAll(".faq-item").forEach(el => el.classList.remove("open"));
    if (!isOpen) {
        item.classList.add("open");
    }
}

// 6. Filter FAQs via search box
function filterFaqs(query) {
    const q = query.toLowerCase().trim();
    const items = document.querySelectorAll(".faq-item");
    items.forEach(item => {
        const text = item.textContent.toLowerCase();
        if (text.includes(q)) {
            item.style.display = "block";
        } else {
            item.style.display = "none";
        }
    });
}

// 7. Ticket Submission Simulation
function handleTicketSubmit(e) {
    e.preventDefault();

    const name = document.getElementById("ticketName")?.value.trim() || "";
    const email = document.getElementById("ticketEmail")?.value.trim() || "";
    const mobile = document.getElementById("ticketMobile")?.value.trim() || "";
    const deptSelect = document.getElementById("ticketDept");
    const deptText = deptSelect?.options[deptSelect.selectedIndex]?.text || "General Desk";
    const priority = document.getElementById("selectedPriority")?.value || "NORMAL";
    const desc = document.getElementById("ticketDesc")?.value.trim() || "";
    const alertBox = document.getElementById("ticketAlert");
    const btn = document.getElementById("ticketSubmitBtn");

    if (!name || !email || !mobile || !deptSelect?.value || !desc) {
        if (alertBox) {
            alertBox.className = "mb-4 p-3 rounded-lg text-xs font-semibold bg-red-100 text-red-700 border border-red-200 block";
            alertBox.textContent = "Please fill in all mandatory fields (*).";
        }
        return;
    }

    if (alertBox) alertBox.className = "hidden";
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            Registering Ticket with Nodal Cell...
        `;
    }

    setTimeout(() => {
        const randomId = "TKT-IO-" + Math.floor(100000 + Math.random() * 900000);
        const resTicketId = document.getElementById("resTicketId");
        const resName = document.getElementById("resName");
        const resDept = document.getElementById("resDept");
        const resPriority = document.getElementById("resPriority");

        if (resTicketId) resTicketId.textContent = randomId;
        if (resName) resName.textContent = name;
        if (resDept) resDept.textContent = deptText;
        if (resPriority) resPriority.textContent = priority;

        const formWrap = document.getElementById("ticketFormWrap");
        const successWrap = document.getElementById("ticketSuccessWrap");

        if (formWrap) formWrap.classList.add("hidden");
        if (successWrap) {
            successWrap.classList.remove("hidden");
            successWrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    }, 1000);
}

function resetTicketForm() {
    const form = document.getElementById("ticketForm");
    if (form) form.reset();

    const btn = document.getElementById("ticketSubmitBtn");
    if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
            <svg class="w-4 h-4 text-[#D4A94C]" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
            </svg>
            Submit Grievance / Query Ticket
        `;
    }

    const successWrap = document.getElementById("ticketSuccessWrap");
    const formWrap = document.getElementById("ticketFormWrap");

    if (successWrap) successWrap.classList.add("hidden");
    if (formWrap) formWrap.classList.remove("hidden");
}

// 8. Ticket Status Checker Simulation
function checkTicketStatus() {
    const input = document.getElementById("trackInput")?.value.trim();
    const resBox = document.getElementById("trackResult");
    const resId = document.getElementById("trackResId");

    if (!input) {
        alert("Please enter a Ticket ID or Application ID to search.");
        return;
    }

    if (resId) resId.textContent = input.toUpperCase();
    if (resBox) {
        resBox.classList.remove("hidden");
        resBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}
