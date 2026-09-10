/**
 * IndustryOne - National Industrial Approval System
 * Applicant / Entrepreneur Dashboard Logic
 */

// Global State
let userSession = null;
let currentFilter = "ALL";
let uploadedFileName = "";

// Statutory Industrial Clearances Dataset
let clearancesData = [
    {
        id: "CLR-01",
        name: "Consent to Establish (CTE - Red Category)",
        dept: "Madhya Pradesh Pollution Control Board (MPPCB)",
        category: "Environment & Pollution",
        refNo: "MPPCB/CTE/2026/0912",
        appDate: "12 Jan 2026",
        grantDate: "30 Jan 2026",
        status: "APPROVED", // APPROVED, REVIEW, ACTION
        slaText: "Cleared in 18 Days (45-Day Norm)",
        slaStatus: "good",
        officer: "Er. Alok Verma, Superintending Engineer",
        certNumber: "CTE-MP-2026-98124",
        remarks: "Consent granted with standard effluent treatment (ETP) and continuous emission monitoring system (CEMS) conditions."
    },
    {
        id: "CLR-02",
        name: "Industrial Land Possession & Registered Lease Deed",
        dept: "MP Industrial Development Corporation (MPIDC)",
        category: "Land & Infrastructure",
        refNo: "MPIDC/PTM-SEC3/PLOT-402",
        appDate: "05 Jan 2026",
        grantDate: "22 Jan 2026",
        status: "APPROVED",
        slaText: "Possession Handed Over (Plot 402, 5 Acres)",
        slaStatus: "good",
        officer: "Executive Director, MPIDC Regional Office",
        certNumber: "LEASE-DEED-2026-402",
        remarks: "99-year industrial lease deed registered and physical boundary demarcated."
    },
    {
        id: "CLR-03",
        name: "Factory Building Plan & Occupational Health Approval",
        dept: "Chief Inspectorate of Factories (CIF)",
        category: "Labour & Occupational Safety",
        refNo: "CIF/IND/FP-2026-109",
        appDate: "15 Feb 2026",
        grantDate: "Pending",
        status: "REVIEW",
        slaText: "6 Days Remaining (Target: 18 Mar 2026)",
        slaStatus: "normal",
        officer: "Dr. V. K. Sharma, Joint Director (Safety)",
        certNumber: null,
        remarks: "Joint site inspection scheduled for 14 March 2026. Safety exits and ventilation shafts under scrutiny."
    },
    {
        id: "CLR-04",
        name: "1500 kVA High Tension (HT) Industrial Power Load Sanction",
        dept: "MP Western Discom (MPPKVVCL)",
        category: "Energy & Utilities",
        refNo: "DISCOM/HT/2026/894",
        appDate: "18 Feb 2026",
        grantDate: "Pending",
        status: "ACTION",
        slaText: "Clarification Overdue • 48 Hours Left",
        slaStatus: "urgent",
        officer: "SDO (HT Works), Pithampur Circle",
        certNumber: null,
        remarks: "Objection: Substation Single Line Diagram (SLD) requires CEI Grade-1 authenticated stamp."
    },
    {
        id: "CLR-05",
        name: "Fire Safety Provisional NOC",
        dept: "Directorate of Fire & Emergency Services",
        category: "Disaster Management",
        refNo: "FIRE/NOC/2026/415",
        appDate: "10 Jan 2026",
        grantDate: "28 Jan 2026",
        status: "APPROVED",
        slaText: "Cleared in 18 Days",
        slaStatus: "good",
        officer: "Divisional Fire Officer, Indore Division",
        certNumber: "NOC-FIRE-MP-4158",
        remarks: "Hydrant layout, fire pump capacity (2850 LPM), and emergency water reservoir verified."
    },
    {
        id: "CLR-06",
        name: "Borewell Water Abstraction NOC",
        dept: "Central Ground Water Authority (CGWA)",
        category: "Water Resources",
        refNo: "CGWA/IND/2026/220",
        appDate: "20 Jan 2026",
        grantDate: "12 Feb 2026",
        status: "APPROVED",
        slaText: "Cleared in 23 Days",
        slaStatus: "good",
        officer: "Regional Director, CGWA West",
        certNumber: "CGWA-NOC-2026-902",
        remarks: "Granted for 45 m3/day abstraction with mandatory rainwater harvesting recharge pit."
    }
];

// Initialize on DOM Ready
document.addEventListener("DOMContentLoaded", () => {
    loadUserSession();
    renderMetrics();
    renderClearancesList();
    renderVaultGrid();
    setupDropdownListeners();
});

/**
 * 1. Load User Profile from localStorage
 */
function loadUserSession() {
    try {
        const stored = localStorage.getItem("industryOneUser");
        if (stored) {
            userSession = JSON.parse(stored);
        }
    } catch (e) {
        console.warn("Error parsing user profile from localStorage", e);
    }

    // Sensible defaults if loaded without prior login
    if (!userSession) {
        userSession = {
            name: "Gargi Sharma",
            company: "Gargi Industrial Solutions LLP",
            email: "gargis453@gmail.com",
            udyam: "UDYAM-MP-08-009124",
            appId: "IND-2026-8942",
            role: "Applicant"
        };
    }

    // Populate DOM
    const initials = (userSession.name || "AP")
        .split(" ")
        .map(n => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const userAvatar = document.getElementById("userAvatar");
    if (userAvatar) userAvatar.textContent = initials || "AP";

    const navUserName = document.getElementById("navUserName");
    if (navUserName) navUserName.textContent = userSession.company || userSession.name;

    const userRoleBadge = document.getElementById("userRoleBadge");
    if (userRoleBadge) userRoleBadge.textContent = "Verified Applicant";

    const heroCompanyName = document.getElementById("heroCompanyName");
    if (heroCompanyName) heroCompanyName.textContent = userSession.company || userSession.name;

    const dropdownCompany = document.getElementById("dropdownCompany");
    if (dropdownCompany) dropdownCompany.textContent = userSession.company || userSession.name;

    const dropdownEmail = document.getElementById("dropdownEmail");
    if (dropdownEmail) dropdownEmail.textContent = userSession.email;

    const dropdownUdyam = document.getElementById("dropdownUdyam");
    if (dropdownUdyam) dropdownUdyam.textContent = userSession.udyam || "UDYAM-MP-08-009124";

    const heroUdyam = document.getElementById("heroUdyam");
    if (heroUdyam) heroUdyam.textContent = userSession.udyam || "UDYAM-MP-08-009124";

    const heroAppId = document.getElementById("heroAppId");
    if (heroAppId) heroAppId.textContent = userSession.appId || "IND-2026-8942";
}

/**
 * 2. Calculate and render metric KPI counts
 */
function renderMetrics() {
    const total = clearancesData.length;
    const approved = clearancesData.filter(c => c.status === "APPROVED").length;
    const review = clearancesData.filter(c => c.status === "REVIEW").length;
    const action = clearancesData.filter(c => c.status === "ACTION").length;

    const metricTotal = document.getElementById("metricTotal");
    const metricApproved = document.getElementById("metricApproved");
    const metricReview = document.getElementById("metricReview");
    const metricAction = document.getElementById("metricAction");

    if (metricTotal) metricTotal.textContent = total;
    if (metricApproved) metricApproved.textContent = approved;
    if (metricReview) metricReview.textContent = review;
    if (metricAction) metricAction.textContent = action;

    const tabCountAll = document.getElementById("tabCountAll");
    const tabCountApproved = document.getElementById("tabCountApproved");
    const tabCountReview = document.getElementById("tabCountReview");
    const tabCountAction = document.getElementById("tabCountAction");

    if (tabCountAll) tabCountAll.textContent = total;
    if (tabCountApproved) tabCountApproved.textContent = approved;
    if (tabCountReview) tabCountReview.textContent = review;
    if (tabCountAction) tabCountAction.textContent = action;

    const unreadAlertCount = document.getElementById("unreadAlertCount");
    if (unreadAlertCount) {
        unreadAlertCount.textContent = action;
        if (action === 0) {
            unreadAlertCount.classList.add("hidden");
        } else {
            unreadAlertCount.classList.remove("hidden");
        }
    }

    const urgentActionAlert = document.getElementById("urgentActionAlert");
    if (urgentActionAlert) {
        if (action === 0) {
            urgentActionAlert.style.display = "none";
        } else {
            urgentActionAlert.style.display = "flex";
        }
    }
}

/**
 * 3. Render Clearances Pipeline List
 */
function renderClearancesList() {
    const container = document.getElementById("clearancesList");
    if (!container) return;

    const query = (document.getElementById("clearanceSearchInput")?.value || "").toLowerCase().trim();

    const filtered = clearancesData.filter(item => {
        const matchesFilter = (currentFilter === "ALL") || (item.status === currentFilter);
        const matchesSearch = !query ||
            item.name.toLowerCase().includes(query) ||
            item.dept.toLowerCase().includes(query) ||
            item.refNo.toLowerCase().includes(query) ||
            item.category.toLowerCase().includes(query);
        return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="p-8 text-center bg-white/5 rounded-xl border border-white/10 text-[#819BC2]">
                <svg class="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm text-[#F8F1DF] font-semibold">No statutory clearances match your filter criteria</p>
                <p class="text-xs mt-1">Try resetting the search or selecting 'All Clearances'.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(c => {
        let badgeHtml = "";
        let actionBtnHtml = "";
        let borderAccent = "border-white/10";

        if (c.status === "APPROVED") {
            badgeHtml = `
                <span class="status-badge status-approved">
                    <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    Approved & Granted
                </span>
            `;
            actionBtnHtml = `
                <button onclick="openCertificateModal('${escapeHtml(c.name)}', '${escapeHtml(c.dept)}', '${c.certNumber || c.refNo}', '${c.grantDate}')" 
                    class="btn-action-outline text-xs">
                    <svg class="w-3.5 h-3.5 text-[#D4A94C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View Certificate</span>
                </button>
                <button onclick="triggerDownloadCertificate('${escapeHtml(c.name)}')" 
                    class="btn-action-gold py-1.5 px-3 text-xs">
                    <svg class="w-3.5 h-3.5 text-[#07152F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download NOC</span>
                </button>
            `;
            borderAccent = "border-emerald-500/30";
        } else if (c.status === "REVIEW") {
            badgeHtml = `
                <span class="status-badge status-review">
                    <span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                    Under Scrutiny
                </span>
            `;
            actionBtnHtml = `
                <button onclick="showToast('Joint Inspection is scheduled on 14 Mar 2026. Inspector details dispatched via SMS.', 'info')" 
                    class="btn-action-outline text-xs">
                    <svg class="w-3.5 h-3.5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Inspection Schedule</span>
                </button>
            `;
            borderAccent = "border-sky-500/30";
        } else if (c.status === "ACTION") {
            badgeHtml = `
                <span class="status-badge status-action">
                    <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                    Action Required
                </span>
            `;
            actionBtnHtml = `
                <button onclick="openResolveQueryModal('${escapeHtml(c.dept)}', '${escapeHtml(c.name)}', '${c.refNo}')" 
                    class="btn-action-gold py-1.5 px-3 text-xs bg-amber-400 text-black border-amber-300">
                    <svg class="w-3.5 h-3.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Resolve Objection Now</span>
                </button>
            `;
            borderAccent = "border-amber-500/50 bg-amber-500/5";
        }

        return `
            <div class="p-4 sm:p-5 rounded-xl bg-white/[0.03] border ${borderAccent} hover:bg-white/[0.06] transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div class="space-y-1.5 max-w-2xl">
                    <div class="flex flex-wrap items-center gap-2">
                        <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#819BC2]">${c.category}</span>
                        <span class="text-[11px] font-mono text-[#D4A94C]">${c.refNo}</span>
                        ${badgeHtml}
                    </div>
                    <h4 class="text-sm sm:text-base font-bold text-[#F8F1DF]">${c.name}</h4>
                    <p class="text-xs text-[#C9C2B2]">${c.dept}</p>
                    <div class="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-[#819BC2] font-mono">
                        <span>Applied: <strong class="text-[#F8F1DF]">${c.appDate}</strong></span>
                        <span>•</span>
                        <span>Turnaround SLA: <strong class="${c.status === 'ACTION' ? 'text-amber-300' : 'text-emerald-400'}">${c.slaText}</strong></span>
                        <span>•</span>
                        <span>Desk: <strong class="text-[#F8F1DF]">${c.officer}</strong></span>
                    </div>
                    ${c.remarks ? `<p class="text-[11px] text-[#819BC2] italic pt-1 border-t border-white/5">Note: ${c.remarks}</p>` : ''}
                </div>

                <div class="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                    ${actionBtnHtml}
                </div>
            </div>
        `;
    }).join("");
}

/**
 * 4. Render e-Certificate Vault Cards
 */
function renderVaultGrid() {
    const container = document.getElementById("vaultGrid");
    if (!container) return;

    const approvedList = clearancesData.filter(c => c.status === "APPROVED");

    container.innerHTML = approvedList.map(c => `
        <div class="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-[#D4A94C]/40 transition-all flex flex-col justify-between space-y-4">
            <div>
                <div class="flex items-center justify-between text-[11px] font-mono mb-2">
                    <span class="text-emerald-400 flex items-center gap-1">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                        Digitally Signed
                    </span>
                    <span class="text-[#819BC2]">${c.grantDate}</span>
                </div>
                <h4 class="text-sm font-bold text-[#F8F1DF] leading-snug">${c.name}</h4>
                <p class="text-xs text-[#C9C2B2] mt-1">${c.dept}</p>
                <div class="mt-3 p-2 rounded bg-black/20 font-mono text-[10px] text-[#819BC2]">
                    Licence No: <span class="text-[#D4A94C] font-semibold">${c.certNumber || c.refNo}</span>
                </div>
            </div>

            <div class="flex items-center gap-2 pt-2 border-t border-white/10">
                <button onclick="openCertificateModal('${escapeHtml(c.name)}', '${escapeHtml(c.dept)}', '${c.certNumber || c.refNo}', '${c.grantDate}')" 
                    class="btn-action-outline text-xs w-full justify-center">
                    View Stamp
                </button>
                <button onclick="triggerDownloadCertificate('${escapeHtml(c.name)}')" 
                    class="btn-action-gold text-xs py-2 px-3 w-full justify-center">
                    Download
                </button>
            </div>
        </div>
    `).join("");
}

/**
 * Filter by Tab
 */
function setFilter(filterType, element) {
    currentFilter = filterType;
    document.querySelectorAll(".filter-tab").forEach(btn => btn.classList.remove("active"));
    if (element) element.classList.add("active");
    renderClearancesList();
}

function filterClearances() {
    renderClearancesList();
}

/**
 * Modal Controllers
 */
function openModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    }
}

function closeModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove("active");
        document.body.style.overflow = "";
    }
}

// Close on clicking backdrop
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) {
        e.target.classList.remove("active");
        document.body.style.overflow = "";
    }
});

// Close on Escape
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay.active").forEach(m => {
            m.classList.remove("active");
        });
        document.body.style.overflow = "";
    }
});

/**
 * Query Resolution Flow
 */
function openResolveQueryModal(dept, clearance, ref) {
    const queryDept = document.getElementById("queryDept");
    const queryAppRef = document.getElementById("queryAppRef");
    const uploadText = document.getElementById("uploadStatusText");
    const note = document.getElementById("queryResponseNote");
    const fileInput = document.getElementById("queryFileUpload");

    if (queryDept) queryDept.textContent = dept;
    if (queryAppRef) queryAppRef.textContent = `REF: ${ref}`;
    if (uploadText) uploadText.textContent = "Click to browse or drag & drop CEI-certified drawing";
    if (note) note.value = "";
    if (fileInput) fileInput.value = "";
    uploadedFileName = "";

    openModal("queryModal");
}

function handleFileSelect(input) {
    if (input.files && input.files[0]) {
        uploadedFileName = input.files[0].name;
        const uploadText = document.getElementById("uploadStatusText");
        if (uploadText) {
            uploadText.innerHTML = `✓ File Selected: <strong class="text-[#D4A94C]">${uploadedFileName}</strong> (${(input.files[0].size / 1024).toFixed(1)} KB)`;
        }
        showToast(`Document loaded: ${uploadedFileName}`, "info");
    }
}

function handleQuerySubmit(event) {
    event.preventDefault();

    const note = document.getElementById("queryResponseNote")?.value.trim();
    if (!note) {
        showToast("Please provide a clarification note.", "error");
        return;
    }

    const submitBtn = document.getElementById("querySubmitBtn");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-[#07152F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Submitting Compliance to Department Desk...</span>
        `;
    }

    setTimeout(() => {
        // Update dataset
        const targetClearance = clearancesData.find(c => c.id === "CLR-04");
        if (targetClearance) {
            targetClearance.status = "REVIEW";
            targetClearance.slaText = "Clarification Submitted (Under Verification)";
            targetClearance.slaStatus = "normal";
            targetClearance.remarks = `Compliance uploaded: "${note.slice(0, 70)}..." with attached authenticated SLD drawing.`;
        }

        renderMetrics();
        renderClearancesList();
        closeModal("queryModal");

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Submit Clarification to Officer</span>`;
        }

        showToast("Clarification and drawing submitted successfully to Discom Chief Engineer Desk!", "success");
    }, 1200);
}

/**
 * Certificate Viewer Modal
 */
function openCertificateModal(clearanceName, authority, certNum, date) {
    const titleEl = document.getElementById("certClearanceName");
    const authEl = document.getElementById("certAuthority");
    const numEl = document.getElementById("certNumber");
    const dateEl = document.getElementById("certDate");
    const compEl = document.getElementById("certCompany");

    if (titleEl) titleEl.textContent = clearanceName;
    if (authEl) authEl.textContent = authority;
    if (numEl) numEl.textContent = certNum;
    if (dateEl) dateEl.textContent = date;
    if (compEl && userSession) compEl.textContent = userSession.company || userSession.name;

    openModal("certificateModal");
}

function triggerDownloadCertificate(name = "Statutory Clearance NOC") {
    showToast(`Generating digitally signed certificate for: ${name}...`, "info");
    setTimeout(() => {
        showToast(`Downloaded official PDF with QR code & digital seal.`, "success");
    }, 1200);
}

function downloadAllCertificates() {
    showToast("Packaging consolidated statutory dossier (4 NOCs + Geo-coordinates + Lease Deed)...", "info");
    setTimeout(() => {
        showToast("Downloaded IndustryOne_Dossier_IND-2026-8942.zip", "success");
    }, 1500);
}

/**
 * Composite Application Form (CAF) Modal
 */
function openCafModal() {
    openModal("cafModal");
}

function handleCafSubmit(event) {
    event.preventDefault();

    const sector = document.getElementById("cafSectorSelect")?.value || "GENERAL";
    const name = document.getElementById("cafClearanceName")?.value || "Additional Clearance";
    const details = document.getElementById("cafPlantDetails")?.value || "";

    const newId = `CLR-0${clearancesData.length + 1}`;
    const newClearance = {
        id: newId,
        name: name,
        dept: getDeptForSector(sector),
        category: sector,
        refNo: `CAF/2026/IND-${Math.floor(1000 + Math.random() * 9000)}`,
        appDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        grantDate: "Pending",
        status: "REVIEW",
        slaText: "30 Days Remaining (PSGA Standard)",
        slaStatus: "normal",
        officer: "Single Window Scrutiny Desk Officer",
        certNumber: null,
        remarks: `Scope: ${details.slice(0, 80)}`
    };

    clearancesData.unshift(newClearance);
    renderMetrics();
    renderClearancesList();
    closeModal("cafModal");

    showToast(`New Application (${name}) filed with Single Window Clearance Desk!`, "success");
}

function getDeptForSector(sector) {
    switch (sector) {
        case "ENVIRONMENT": return "State Pollution Control Board & MoEFCC Desk";
        case "LABOUR": return "Directorate of Industrial Health and Safety";
        case "ENERGY": return "State Electricity Regulatory & Distribution Utility";
        case "SAFETY": return "Petroleum & Explosives Safety Organization (PESO)";
        case "WATER": return "Central Ground Water Authority (CGWA)";
        default: return "Single Window Facilitation Authority";
    }
}

/**
 * Dropdown Handlers
 */
function setupDropdownListeners() {
    document.addEventListener("click", (e) => {
        const profileDropdown = document.getElementById("profileDropdown");
        const profileDropdownBtn = document.getElementById("profileDropdownBtn");

        if (profileDropdown && profileDropdownBtn) {
            if (!profileDropdownBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.add("hidden");
            }
        }
    });
}

function toggleProfileDropdown() {
    const dropdown = document.getElementById("profileDropdown");
    if (dropdown) dropdown.classList.toggle("hidden");
}

function toggleNotifications() {
    const actionCount = clearancesData.filter(c => c.status === "ACTION").length;
    if (actionCount > 0) {
        showToast("You have 1 pending objection from Electricity Discom regarding Substation Single Line Diagram.", "warning");
    } else {
        showToast("All statutory filings are in order. No pending queries from department desks.", "success");
    }
}

/**
 * Logout Handler
 */
function handleLogout() {
    const token = localStorage.getItem("authToken");

    if (token) {
        // Asynchronous logout notification to Spring Boot backend
        fetch("http://localhost:8080/api/logout", {
            method: "POST",
            headers: {
                "X-Auth-Token": token
            }
        }).catch(() => {});
    }

    // Clear local storage
    localStorage.removeItem("authToken");
    localStorage.removeItem("industryOneUser");

    showToast("Signing out of Industrial Portal...", "info");
    setTimeout(() => {
        window.location.href = "login.html";
    }, 700);
}

/**
 * Toast Notification System
 */
function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `px-4 py-3 rounded-xl border text-xs font-semibold shadow-2xl flex items-center gap-2.5 transition-all duration-300 transform translate-y-2 opacity-0 pointer-events-auto max-w-md`;

    if (type === "success") {
        toast.className += " bg-emerald-950/95 border-emerald-500 text-emerald-200";
        toast.innerHTML = `<span class="text-emerald-400 text-sm">✓</span> <span>${escapeHtml(message)}</span>`;
    } else if (type === "error") {
        toast.className += " bg-rose-950/95 border-rose-500 text-rose-200";
        toast.innerHTML = `<span class="text-rose-400 text-sm">⚠️</span> <span>${escapeHtml(message)}</span>`;
    } else if (type === "warning") {
        toast.className += " bg-amber-950/95 border-amber-500 text-amber-200";
        toast.innerHTML = `<span class="text-amber-400 text-sm">⚠️</span> <span>${escapeHtml(message)}</span>`;
    } else {
        toast.className += " bg-[#0b2247]/95 border-[#D4A94C] text-[#F8F1DF]";
        toast.innerHTML = `<span class="text-[#D4A94C] text-sm">ℹ️</span> <span>${escapeHtml(message)}</span>`;
    }

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.remove("translate-y-2", "opacity-0");
    });

    setTimeout(() => {
        toast.classList.add("translate-y-2", "opacity-0");
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Accessibility Font Size
 */
let currentFontLevel = 0;
function adjustFontSize(delta) {
    const root = document.documentElement;
    if (delta === 0) {
        currentFontLevel = 0;
        root.style.fontSize = "16px";
    } else {
        currentFontLevel += delta;
        if (currentFontLevel > 2) currentFontLevel = 2;
        if (currentFontLevel < -1) currentFontLevel = -1;

        const sizeMap = {
            "-1": "14.5px",
            "0": "16px",
            "1": "17.5px",
            "2": "19px"
        };
        root.style.fontSize = sizeMap[currentFontLevel] || "16px";
    }
}

/**
 * Helper to escape HTML and prevent XSS
 */
function escapeHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
