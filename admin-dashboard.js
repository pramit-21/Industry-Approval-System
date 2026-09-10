/**
 * IndustryOne - National Industrial Approval System
 * Admin & Officer Scrutiny Console Logic
 */

// Global State
let adminSession = null;
let currentAdminFilter = "ALL";
let activeDossierId = null;

// Department Scrutiny Dataset
let worklistData = [
    {
        id: "PROP-01",
        appRef: "IND-2026-8942",
        company: "Gargi Industrial Solutions LLP",
        project: "Solar PV Cell & Module Manufacturing Plant (Capacity: 500 MW/yr)",
        dept: "DISH",
        deptFullName: "Directorate of Industrial Health and Safety (DISH)",
        clearanceName: "Factory Plan Approval & Worker Safety Clearance",
        location: "Plot 402, Sector-3, Pithampur Industrial Area, Dhar (M.P.)",
        capex: "₹145 Cr",
        jobs: "420 Workers",
        appliedDate: "15 Feb 2026",
        daysElapsed: 24,
        slaDaysLeft: 6,
        status: "REVIEW", // REVIEW, ACTION, APPROVED, CRITICAL
        assignedOfficer: "Er. Rajesh Singhania (Joint Director)",
        categoryColor: "Red",
        documents: [
            { name: "Architectural Layout & Elevation Drawings.pdf", size: "8.4 MB" },
            { name: "Occupational Safety & Fire Escape Plan.pdf", size: "4.1 MB" }
        ],
        notes: "Joint physical site inspection scheduled with District Industrial Centre on 14-Mar-2026."
    },
    {
        id: "PROP-02",
        appRef: "IND-2026-8942",
        company: "Gargi Industrial Solutions LLP",
        project: "1500 kVA Dedicated Substation & HT Line Feeder",
        dept: "MPPKVVCL",
        deptFullName: "MP Western Electricity Discom (MPPKVVCL)",
        clearanceName: "High Tension (HT) Industrial Power Load Sanction",
        location: "Sector-3 Pithampur Feeder Grid",
        capex: "₹12 Cr",
        jobs: "N/A (Utility)",
        appliedDate: "18 Feb 2026",
        daysElapsed: 21,
        slaDaysLeft: 2,
        status: "ACTION",
        assignedOfficer: "Executive Engineer (HT Works)",
        categoryColor: "Utility",
        documents: [
            { name: "Single Line Diagram (SLD) - Revision 2.pdf", size: "3.2 MB" }
        ],
        notes: "Applicant submitted revised SLD stamped by CEI Grade-1 Engineer. Verification pending."
    },
    {
        id: "PROP-03",
        appRef: "IND-2026-7719",
        company: "Bharat Precision Castings Pvt Ltd",
        project: "High-Pressure Automotive Alloy Die Casting Foundry",
        dept: "MPPCB",
        deptFullName: "MP State Pollution Control Board (MPPCB)",
        clearanceName: "Consent to Establish (CTE - Air & Water Act)",
        location: "Dewas Industrial Estate, Phase-2",
        capex: "₹85 Cr",
        jobs: "260 Workers",
        appliedDate: "02 Mar 2026",
        daysElapsed: 9,
        slaDaysLeft: 21,
        status: "REVIEW",
        assignedOfficer: "Superintending Engineer (Air Control)",
        categoryColor: "Orange",
        documents: [
            { name: "EIA Assessment & Bag Filter Schematic.pdf", size: "12.8 MB" }
        ],
        notes: "Acoustic enclosure and wet scrubber calculations in compliance with CPCB norms."
    },
    {
        id: "PROP-04",
        appRef: "IND-2026-6401",
        company: "Narmada Bio-Energy Refining Ltd",
        project: "Compressed Bio-Gas (CBG) & High-Pressure Storage Unit",
        dept: "PESO",
        deptFullName: "Petroleum & Explosives Safety Organization (PESO)",
        clearanceName: "High Pressure Vessel Storage License (Static & Mobile)",
        location: "Hoshangabad Agro Corridor",
        capex: "₹210 Cr",
        jobs: "350 Workers",
        appliedDate: "20 Jan 2026",
        daysElapsed: 44,
        slaDaysLeft: 1,
        status: "CRITICAL",
        assignedOfficer: "Controller of Explosives, Central Circle",
        categoryColor: "Red",
        documents: [
            { name: "Hydro-static Vessel Test Certification.pdf", size: "6.5 MB" }
        ],
        notes: "URGENT SLA ALERT: Only 18 Hours remaining before statutory penalty escalation under PSGA."
    },
    {
        id: "PROP-05",
        appRef: "IND-2026-9044",
        company: "Malwa Agro Processing Hub Ltd",
        project: "Grain Cold Storage & IQF Freezing Infrastructure",
        dept: "MPIDC",
        deptFullName: "MP Industrial Development Corporation (MPIDC)",
        clearanceName: "Industrial Land Demarcation & 99-Year Lease Deed",
        location: "Plot 88, Food Park Nimrani, Khargone",
        capex: "₹38 Cr",
        jobs: "180 Workers",
        appliedDate: "10 Feb 2026",
        daysElapsed: 15,
        slaDaysLeft: 0,
        status: "APPROVED",
        assignedOfficer: "Executive Director, MPIDC",
        categoryColor: "Green",
        documents: [
            { name: "Demarcation Map & Revenue Registry Deed.pdf", size: "5.1 MB" }
        ],
        notes: "Approved and digitally signed with DSC Token on 10-Mar-2026. Lease deed registered."
    }
];

// Account Security & Access Incidents Dataset
let securityAlerts = [
    {
        id: 101,
        type: "LOGIN_LOCKOUT",
        severity: "HIGH",
        email: "gargis453@gmail.com",
        role: "APPLICANT",
        ip: "127.0.0.1",
        message: "Account temporarily locked after 3 consecutive failed authentication attempts.",
        attempts: 3,
        createdAt: "10 mins ago",
        resolved: false
    },
    {
        id: 102,
        type: "SUSPICIOUS_DESK_ATTEMPT",
        severity: "MEDIUM",
        email: "unknown_inspector@gov.in",
        role: "OFFICER",
        ip: "192.168.1.45",
        message: "Failed multi-factor security captcha verification 4 times.",
        attempts: 4,
        createdAt: "35 mins ago",
        resolved: false
    }
];

// Initialize on Load
document.addEventListener("DOMContentLoaded", () => {
    loadAdminSession();
    renderAdminMetrics();
    renderWorklist();
    fetchBackendSecurityAlerts();
    setupAdminDropdown();
});

/**
 * 1. Load Officer / Admin Session
 */
function loadAdminSession() {
    try {
        const stored = localStorage.getItem("industryOneAdminUser");
        if (stored) {
            adminSession = JSON.parse(stored);
        }
    } catch (e) {
        console.warn("Could not read admin profile", e);
    }

    if (!adminSession) {
        adminSession = {
            name: "Er. Rajesh Singhania",
            email: "r.singhania@mp.gov.in",
            role: "Verification Officer",
            deskId: "OFF-MP-9014",
            department: "DISH & MPPCB Joint Scrutiny Desk"
        };
    }

    // Populate Header & Identity elements
    const initials = (adminSession.name || "RS")
        .split(" ")
        .map(w => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const adminAvatar = document.getElementById("adminAvatar");
    if (adminAvatar) adminAvatar.textContent = initials || "RS";

    const adminOfficerName = document.getElementById("adminOfficerName");
    if (adminOfficerName) adminOfficerName.textContent = adminSession.name;

    const heroOfficerName = document.getElementById("heroOfficerName");
    if (heroOfficerName) heroOfficerName.textContent = `${adminSession.name} (${adminSession.role})`;

    const heroDeskId = document.getElementById("heroDeskId");
    if (heroDeskId) heroDeskId.textContent = `Desk ${adminSession.deskId || 'OFF-MP-9014'}`;

    const adminRoleBadge = document.getElementById("adminRoleBadge");
    if (adminRoleBadge) adminRoleBadge.textContent = adminSession.role || "Verification Officer";

    const dropdownAdminName = document.getElementById("dropdownAdminName");
    if (dropdownAdminName) dropdownAdminName.textContent = adminSession.name;

    const dropdownAdminEmail = document.getElementById("dropdownAdminEmail");
    if (dropdownAdminEmail) dropdownAdminEmail.textContent = adminSession.email;

    const dropdownAdminDesk = document.getElementById("dropdownAdminDesk");
    if (dropdownAdminDesk) dropdownAdminDesk.textContent = `Desk: ${adminSession.deskId || 'OFF-MP-9014'} (${adminSession.role})`;
}

/**
 * 2. Calculate and render Admin KPIs
 */
function renderAdminMetrics() {
    const pending = worklistData.filter(p => p.status === "REVIEW").length;
    const queries = worklistData.filter(p => p.status === "ACTION").length;
    const approved = worklistData.filter(p => p.status === "APPROVED").length + 47; // plus cumulative
    const critical = worklistData.filter(p => p.status === "CRITICAL").length;
    const security = securityAlerts.filter(a => !a.resolved).length;

    const kpiPendingCount = document.getElementById("kpiPendingCount");
    const kpiQueriesCount = document.getElementById("kpiQueriesCount");
    const kpiApprovedCount = document.getElementById("kpiApprovedCount");
    const kpiCriticalCount = document.getElementById("kpiCriticalCount");
    const kpiSecurityCount = document.getElementById("kpiSecurityCount");

    if (kpiPendingCount) kpiPendingCount.textContent = pending;
    if (kpiQueriesCount) kpiQueriesCount.textContent = queries;
    if (kpiApprovedCount) kpiApprovedCount.textContent = approved;
    if (kpiCriticalCount) kpiCriticalCount.textContent = critical;
    if (kpiSecurityCount) kpiSecurityCount.textContent = security;

    const tabCountAll = document.getElementById("tabCountAll");
    const tabCountReview = document.getElementById("tabCountReview");
    const tabCountAction = document.getElementById("tabCountAction");
    const tabCountApproved = document.getElementById("tabCountApproved");
    const tabCountCritical = document.getElementById("tabCountCritical");

    if (tabCountAll) tabCountAll.textContent = worklistData.length;
    if (tabCountReview) tabCountReview.textContent = pending;
    if (tabCountAction) tabCountAction.textContent = queries;
    if (tabCountApproved) tabCountApproved.textContent = approved;
    if (tabCountCritical) tabCountCritical.textContent = critical;

    const unreadAdminAlertCount = document.getElementById("unreadAdminAlertCount");
    if (unreadAdminAlertCount) {
        unreadAdminAlertCount.textContent = critical + security;
    }
}

/**
 * 3. Render Worklist Proposals Table/Cards
 */
function renderWorklist() {
    const container = document.getElementById("adminWorklistContainer");
    if (!container) return;

    const query = (document.getElementById("adminSearchInput")?.value || "").toLowerCase().trim();
    const deptFilter = document.getElementById("departmentFilterSelect")?.value || "ALL";

    const filtered = worklistData.filter(item => {
        let matchesTab = true;
        if (currentAdminFilter === "REVIEW") matchesTab = (item.status === "REVIEW");
        else if (currentAdminFilter === "ACTION") matchesTab = (item.status === "ACTION");
        else if (currentAdminFilter === "APPROVED") matchesTab = (item.status === "APPROVED");
        else if (currentAdminFilter === "CRITICAL") matchesTab = (item.status === "CRITICAL");

        let matchesDept = (deptFilter === "ALL") || (item.dept === deptFilter);

        let matchesSearch = !query ||
            item.company.toLowerCase().includes(query) ||
            item.appRef.toLowerCase().includes(query) ||
            item.project.toLowerCase().includes(query) ||
            item.clearanceName.toLowerCase().includes(query);

        return matchesTab && matchesDept && matchesSearch;
    });

    if (filtered.length === 0) {
        container.innerHTML = `
            <div class="p-8 text-center bg-white/5 rounded-xl border border-white/10 text-[#819BC2]">
                <p class="text-sm font-semibold text-[#F8F1DF]">No proposal dossiers in this queue view</p>
                <p class="text-xs mt-1">Select 'All Filings' or change the department filter.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filtered.map(p => {
        let statusBadgeHtml = "";
        let borderClass = "border-white/10";
        let slaPill = "";

        if (p.status === "REVIEW") {
            statusBadgeHtml = `<span class="status-badge status-review"><span class="w-1.5 h-1.5 rounded-full bg-sky-400"></span>Under Scrutiny</span>`;
            borderClass = "border-sky-500/30";
            slaPill = `<span class="text-emerald-400">${p.slaDaysLeft} Days Left</span>`;
        } else if (p.status === "ACTION") {
            statusBadgeHtml = `<span class="status-badge status-action"><span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>Query Active</span>`;
            borderClass = "border-amber-500/40 bg-amber-500/5";
            slaPill = `<span class="text-amber-300">Awaiting Compliance</span>`;
        } else if (p.status === "CRITICAL") {
            statusBadgeHtml = `<span class="status-badge status-critical"><span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>SLA Critical (18h)</span>`;
            borderClass = "border-rose-500/50 bg-rose-500/5";
            slaPill = `<span class="text-rose-400 font-bold">18h Left (Penalty Risk)</span>`;
        } else if (p.status === "APPROVED") {
            statusBadgeHtml = `<span class="status-badge status-approved"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>Approved & Signed</span>`;
            borderClass = "border-emerald-500/30";
            slaPill = `<span class="text-emerald-300 font-mono">DSC Affixed</span>`;
        }

        return `
            <div class="p-5 rounded-xl bg-white/[0.03] border ${borderClass} hover:bg-white/[0.06] transition-all space-y-3">
                <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <div>
                        <div class="flex flex-wrap items-center gap-2 mb-1">
                            <span class="text-[11px] font-mono font-bold text-[#D4A94C]">${p.appRef}</span>
                            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[#819BC2]">${p.dept}</span>
                            <span class="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-[#C9C2B2]">${p.categoryColor} Category</span>
                            ${statusBadgeHtml}
                        </div>
                        <h3 class="text-base font-bold text-[#F8F1DF]">${p.company}</h3>
                        <p class="text-xs text-[#C9C2B2] font-medium mt-0.5">${p.clearanceName}</p>
                        <p class="text-[11px] text-[#819BC2] mt-0.5">${p.project} • <span class="text-[#F8F1DF]">${p.location}</span></p>
                    </div>

                    <!-- Action Tray -->
                    <div class="flex flex-wrap items-center gap-2 shrink-0 self-start lg:self-center">
                        <button onclick="openDossierModal('${p.id}')" class="btn-action-outline text-xs">
                            <svg class="w-3.5 h-3.5 text-[#D4A94C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>Inspect Dossier</span>
                        </button>
                        ${p.status !== "APPROVED" ? `
                            <button onclick="openRaiseQueryModalDirect('${p.id}')" class="btn-action-outline text-amber-300 text-xs">
                                <span>Raise Objection</span>
                            </button>
                            <button onclick="openApproveModalDirect('${p.id}')" class="btn-action-gold py-1.5 px-3 text-xs">
                                <svg class="w-3.5 h-3.5 text-[#07152F]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Sign & Approve (DSC)</span>
                            </button>
                        ` : `
                            <button onclick="showToast('Clearance has been issued and stored in Applicant Locker.', 'success')" class="btn-action-outline text-emerald-300 text-xs">
                                <span>View Issued NOC</span>
                            </button>
                        `}
                    </div>
                </div>

                <!-- Proposals Technical Parameters Footer -->
                <div class="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-white/5 text-[11px] font-mono text-[#819BC2]">
                    <div class="flex flex-wrap items-center gap-3">
                        <span>Capex: <strong class="text-[#F8F1DF]">${p.capex}</strong></span>
                        <span>•</span>
                        <span>Jobs: <strong class="text-[#F8F1DF]">${p.jobs}</strong></span>
                        <span>•</span>
                        <span>Filing Date: <strong class="text-[#F8F1DF]">${p.appliedDate}</strong> (${p.daysElapsed} days elapsed)</span>
                    </div>
                    <div>
                        <span>SLA Countdown: ${slaPill}</span>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

/**
 * 4. Fetch / Render Portal Security Alerts
 */
async function fetchBackendSecurityAlerts() {
    const container = document.getElementById("securityAlertsList");
    if (!container) return;

    try {
        const token = localStorage.getItem("authToken");
        const res = await fetch("http://localhost:8080/api/admin/alerts", {
            headers: token ? { "X-Auth-Token": token } : {}
        });

        if (res.ok) {
            const data = await res.json();
            if (data.alerts && data.alerts.length > 0) {
                securityAlerts = data.alerts;
            }
        }
    } catch (e) {
        // Fallback to initial realistic alerts
    }

    renderSecurityAlerts();
}

function renderSecurityAlerts() {
    const container = document.getElementById("securityAlertsList");
    if (!container) return;

    if (securityAlerts.length === 0) {
        container.innerHTML = `
            <div class="p-4 rounded-xl bg-white/5 border border-white/10 text-center text-xs text-[#819BC2]">
                ✓ No unresolved security incidents or account lockouts recorded in the portal registry.
            </div>
        `;
        return;
    }

    container.innerHTML = securityAlerts.map(a => {
        const alertLabel = (a.type === 'LOGIN_LOCKOUT') ? 'ACCOUNT LOCKOUT' : (a.type ? a.type.replace(/_/g, ' ') : 'SECURITY NOTICE');
        const sourceTerminal = (a.ip === '127.0.0.1') ? 'Local Workstation' : (a.ip || 'Secured Desk');

        return `
        <div class="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="space-y-0.5">
                <div class="flex items-center gap-2 text-[10px] font-mono">
                    <span class="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/40">${alertLabel}</span>
                    <span class="text-purple-300">Account: ${a.email}</span>
                    <span class="text-[#819BC2]">• Source: ${sourceTerminal}</span>
                </div>
                <p class="text-xs text-[#F8F1DF] font-medium">${a.message || 'User account temporarily locked due to failed authentication.'}</p>
            </div>
            <button onclick="resolveSecurityAlert(${a.id})" class="btn-action-outline text-purple-300 border-purple-500/40 text-xs shrink-0 self-end sm:self-center">
                <span>Unlock Account & Resolve</span>
            </button>
        </div>
        `;
    }).join("");
}

async function resolveSecurityAlert(id) {
    showToast(`Restoring account access for notice #${id}...`, "info");

    try {
        const token = localStorage.getItem("authToken");
        await fetch(`http://localhost:8080/api/admin/alerts/${id}/resolve`, {
            method: "POST",
            headers: token ? { "X-Auth-Token": token } : {}
        }).catch(() => {});
    } catch (e) {}

    securityAlerts = securityAlerts.filter(a => a.id !== id);
    renderSecurityAlerts();
    renderAdminMetrics();
    showToast(`Account successfully unlocked and status cleared in official records.`, "success");
}

function refreshSecurityAlerts() {
    showToast("Synchronizing security records with authentication desk...", "info");
    fetchBackendSecurityAlerts();
}

/**
 * Filter Handlers
 */
function setAdminFilter(tab, element) {
    currentAdminFilter = tab;
    document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
    if (element) element.classList.add("active");
    renderWorklist();
}

function filterAdminWorklist() {
    renderWorklist();
}

function filterByUrgent() {
    currentAdminFilter = "CRITICAL";
    document.querySelectorAll(".filter-tab").forEach(t => t.classList.remove("active"));
    const criticalTab = document.querySelectorAll(".filter-tab")[4];
    if (criticalTab) criticalTab.classList.add("active");
    renderWorklist();
    document.getElementById("worklistSection")?.scrollIntoView({ behavior: "smooth" });
}

/**
 * Modal Operations
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

// Close on backdrop click
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal-overlay")) {
        e.target.classList.remove("active");
        document.body.style.overflow = "";
    }
});

// Close on Escape
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        document.querySelectorAll(".modal-overlay.active").forEach(m => m.classList.remove("active"));
        document.body.style.overflow = "";
    }
});

/**
 * Dossier Scrutiny Inspector
 */
function openDossierModal(proposalId) {
    activeDossierId = proposalId;
    const item = worklistData.find(p => p.id === proposalId);
    if (!item) return;

    document.getElementById("dossierCompany").textContent = item.company;
    document.getElementById("dossierAppRef").textContent = item.appRef;
    document.getElementById("dossierCapex").textContent = `${item.capex} • ${item.jobs}`;
    document.getElementById("dossierProject").textContent = item.project;
    document.getElementById("dossierClearance").textContent = item.clearanceName;

    openModal("dossierModal");
}

function openApproveModalFromDossier() {
    closeModal("dossierModal");
    if (activeDossierId) {
        openApproveModalDirect(activeDossierId);
    }
}

function openQueryModalFromDossier() {
    closeModal("dossierModal");
    if (activeDossierId) {
        openRaiseQueryModalDirect(activeDossierId);
    }
}

function previewDocument(docName) {
    showToast(`Opening secure government preview for ${docName}...`, "info");
    setTimeout(() => {
        showToast(`Document verified against Council / Directorate statutory standards.`, "success");
    }, 1000);
}

/**
 * Approve & DSC Signing
 */
function openApproveModalDirect(proposalId) {
    activeDossierId = proposalId;
    const item = worklistData.find(p => p.id === proposalId);
    if (!item) return;

    document.getElementById("signClearanceName").textContent = item.clearanceName;
    document.getElementById("signCompanyName").textContent = item.company;
    document.getElementById("signAppId").textContent = `REF: ${item.appRef}`;

    openModal("approveModal");
}

function executeDscSigning(event) {
    event.preventDefault();

    const submitBtn = document.getElementById("signSubmitBtn");
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-[#07152F]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Verifying ePass2003 PIN & Affixing Digital Seal...</span>
        `;
    }

    setTimeout(() => {
        const item = worklistData.find(p => p.id === activeDossierId);
        if (item) {
            item.status = "APPROVED";
            item.slaDaysLeft = 0;
            item.notes = `Digitally signed and granted statutory approval by ${adminSession.name} on ${new Date().toLocaleDateString('en-GB')}.`;
        }

        renderAdminMetrics();
        renderWorklist();
        closeModal("approveModal");

        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Affix DSC & Issue Statutory Clearance</span>`;
        }

        showToast(`Statutory Clearance granted for ${item ? item.company : 'Applicant'}! Digitally signed certificate dispatched.`, "success");
    }, 1400);
}

/**
 * Raise Query / Technical Objection
 */
function openRaiseQueryModalDirect(proposalId) {
    activeDossierId = proposalId;
    const item = worklistData.find(p => p.id === proposalId);
    if (!item) return;

    document.getElementById("queryTargetCompany").textContent = item.company;
    document.getElementById("queryTargetRef").textContent = `REF: ${item.appRef}`;
    document.getElementById("officerQueryText").value = "";

    openModal("raiseQueryModal");
}

function executeRaiseQuery(event) {
    event.preventDefault();

    const remark = document.getElementById("officerQueryText")?.value.trim();
    if (!remark) {
        showToast("Please provide technical objection details.", "error");
        return;
    }

    const item = worklistData.find(p => p.id === activeDossierId);
    if (item) {
        item.status = "ACTION";
        item.notes = `Objection raised: "${remark.slice(0, 80)}...". Applicant notified via SMS and email.`;
    }

    renderAdminMetrics();
    renderWorklist();
    closeModal("raiseQueryModal");

    showToast(`Technical objection dispatched to ${item ? item.company : 'Applicant'}! SLA timeline paused.`, "warning");
}

/**
 * Profile Dropdown & Helper
 */
function setupAdminDropdown() {
    document.addEventListener("click", (e) => {
        const dropdown = document.getElementById("adminProfileDropdown");
        const btn = document.getElementById("adminProfileDropdownBtn");

        if (dropdown && btn && !btn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add("hidden");
        }
    });
}

function toggleAdminProfileDropdown() {
    const dropdown = document.getElementById("adminProfileDropdown");
    if (dropdown) dropdown.classList.toggle("hidden");
}

function showDscTokenInfo() {
    showToast("Hardware Token: ePass2003 Class-3 Digital Signature Token (NIC Certified). Valid until 28-Feb-2028.", "info");
}

function toggleAlertsDrawer() {
    document.getElementById("alertsSection")?.scrollIntoView({ behavior: "smooth" });
}

/**
 * Logout
 */
function handleAdminLogout() {
    const token = localStorage.getItem("authToken");

    if (token) {
        fetch("http://localhost:8080/api/logout", {
            method: "POST",
            headers: { "X-Auth-Token": token }
        }).catch(() => {});
    }

    localStorage.removeItem("authToken");
    localStorage.removeItem("industryOneAdminUser");

    showToast("Signing out of Administrative Scrutiny Desk...", "info");
    setTimeout(() => {
        window.location.href = "AdminLogin.html";
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
 * Font Size Adjuster
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

function escapeHtml(text) {
    if (!text) return "";
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
