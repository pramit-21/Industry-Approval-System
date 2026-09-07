// Licence Officer registration page — fully self-contained (fields, rendering,
// validation, and submit handling all live in this one file).

const FIELDS = [
    { name: "fullName", label: "Full name", type: "text" },
    { name: "officialEmail", label: "Official email", type: "email" },
    { name: "mobile", label: "Mobile number", type: "tel" },
    { name: "officerId", label: "Employee / officer ID", type: "text" },
    { name: "department", label: "Department", type: "text" },
    { name: "designation", label: "Designation", type: "text" },
    { name: "officeLocation", label: "Office location", type: "text" },
    { name: "password", label: "Password", type: "password" },
];

const formValues = {};

function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validateField(field, rawValue) {
    const value = (rawValue || "").trim();

    if (!value) return "This field is required.";
    if (field.type === "email" && !isEmail(value)) return "Enter a valid email address.";
    if (field.type === "password" && value.length < 8) return "Password must be at least 8 characters.";
    if (field.type === "tel" && value.replace(/\D/g, "").length < 7) return "Enter a valid mobile number.";
    return "";
}

function clearFieldError(fieldName) {
    const input = document.getElementById(fieldName);
    const errorText = document.getElementById("error-" + fieldName);
    if (input) input.classList.remove("error");
    if (errorText) {
        errorText.classList.remove("show");
        errorText.textContent = "";
    }
}

function showFieldError(fieldName, message) {
    const input = document.getElementById(fieldName);
    const errorText = document.getElementById("error-" + fieldName);
    if (input) input.classList.add("error");
    if (errorText) {
        errorText.textContent = message;
        errorText.classList.add("show");
    }
}

function renderFields() {
    const grid = document.getElementById("fields-grid");
    grid.innerHTML = "";

    FIELDS.forEach((field) => {
        const wrapper = document.createElement("div");
        wrapper.className = "field" + (field.fullWidth ? " full-width" : "");

        const label = document.createElement("label");
        label.setAttribute("for", field.name);
        label.textContent = field.label;

        const input = document.createElement("input");
        input.type = field.type;
        input.id = field.name;
        input.name = field.name;
        input.placeholder = "Enter " + field.label.toLowerCase();
        input.value = formValues[field.name] || "";
        input.addEventListener("input", (e) => {
            formValues[field.name] = e.target.value;
            clearFieldError(field.name);
        });

        const errorText = document.createElement("span");
        errorText.className = "error-text";
        errorText.id = "error-" + field.name;

        wrapper.appendChild(label);
        wrapper.appendChild(input);
        wrapper.appendChild(errorText);
        grid.appendChild(wrapper);
    });
}

renderFields();

document.getElementById("reg-form").addEventListener("submit", function (e) {
    e.preventDefault();

    FIELDS.forEach((f) => clearFieldError(f.name));

    const errors = {};
    FIELDS.forEach((field) => {
        const message = validateField(field, formValues[field.name]);
        if (message) errors[field.name] = message;
    });

    if (Object.keys(errors).length > 0) {
        Object.entries(errors).forEach(([fieldName, message]) => showFieldError(fieldName, message));
        return;
    }

    // No backend yet — this is where you'd send formValues to your API, e.g.:
    // fetch("/api/register/officer", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ ...formValues, status: "pending_approval" }),
    // });

    document.getElementById("form-section").classList.add("hide");
    document.getElementById("confirm-wrap").classList.add("show");
});
