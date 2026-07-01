/* ==========================================================
   Health Self-Check Kiosk — script.js
   Demonstrates: if-else, switch-case, and loop (for...of/forEach)
   ========================================================== */

// TODO: paste your deployed Google Apps Script Web App URL here
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbw4Jpn5Jv17Xa8EPF9KGXxjNOewBQSYHHqKK-HGAcg7yIg7N68j7TqJpOibLbhfNGGu/exec";

// Scale used to position the marker on the gauge (kg/m²)
const GAUGE_MIN = 15;
const GAUGE_MAX = 35;

const form = document.getElementById("bmiForm");
const formNote = document.getElementById("formNote");
const submitBtn = document.getElementById("submitBtn");

const resultEmpty = document.getElementById("resultEmpty");
const resultContent = document.getElementById("resultContent");
const resultBmiValue = document.getElementById("resultBmiValue");
const resultCategory = document.getElementById("resultCategory");
const resultMessage = document.getElementById("resultMessage");
const gaugeMarker = document.getElementById("gaugeMarker");
const saveStatus = document.getElementById("saveStatus");
const resetBtn = document.getElementById("resetBtn");

const historyList = document.getElementById("historyList");
const historyEmpty = document.getElementById("historyEmpty");
const historyCount = document.getElementById("historyCount");

const toast = document.getElementById("toast");
const liveClock = document.getElementById("liveClock");
const stationLabel = document.getElementById("stationLabel");

// In-memory store of this session's submissions (array, used with a loop below)
const submissions = [];

// Fields validated every submission — looping over this list means a new
// required field later only needs one entry here, not another if-block.
const REQUIRED_FIELDS = [
  { id: "name", type: "text" },
  { id: "age", type: "number", min: 1, max: 120 },
  { id: "sex", type: "radio", groupName: "sex" },
  { id: "weight", type: "number", min: 1 },
  { id: "height", type: "number", min: 1 },
];

/* ---------- Kiosk chrome: live clock + station id ---------- */

function tickClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, "0");
  const m = String(now.getMinutes()).padStart(2, "0");
  liveClock.textContent = `${h}:${m}`;
}
tickClock();
setInterval(tickClock, 1000 * 30);

/* ---------- Form submission ---------- */

form.addEventListener("submit", function (e) {
  e.preventDefault();
  formNote.textContent = "";

  let isValid = true;

  // ---------- LOOP: validate every required field in one pass ----------
  for (const field of REQUIRED_FIELDS) {
    let fieldIsValid = true;
    let wrapper;

    if (field.type === "radio") {
      wrapper = document.getElementById("sexGroup").closest(".field");
      const checked = document.querySelector(`input[name="${field.groupName}"]:checked`);

      // ---------- IF-ELSE: a selection is either made or it isn't ----------
      if (!checked) {
        fieldIsValid = false;
      }
    } else {
      const input = document.getElementById(field.id);
      wrapper = input.closest(".field");
      const rawValue = input.value.trim();

      // ---------- IF-ELSE: check emptiness and out-of-range values ----------
      if (rawValue === "") {
        fieldIsValid = false;
      } else if (field.type === "number") {
        const numValue = parseFloat(rawValue);
        if (isNaN(numValue) || numValue <= 0) {
          fieldIsValid = false;
        } else if (field.min !== undefined && numValue < field.min) {
          fieldIsValid = false;
        } else if (field.max !== undefined && numValue > field.max) {
          fieldIsValid = false;
        }
      }
    }

    if (fieldIsValid) {
      wrapper.classList.remove("invalid");
    } else {
      wrapper.classList.add("invalid");
      isValid = false;
    }
  }

  if (!isValid) {
    formNote.textContent = "Please fix the highlighted fields before submitting.";
    return;
  }

  // ---------- Collect values once validation passes ----------
  const name = document.getElementById("name").value.trim();
  const age = parseInt(document.getElementById("age").value, 10);
  const sex = document.querySelector('input[name="sex"]:checked').value;
  const weight = parseFloat(document.getElementById("weight").value);
  const heightCm = parseFloat(document.getElementById("height").value);

  const heightM = heightCm / 100;
  const bmi = +(weight / (heightM * heightM)).toFixed(1);

  let category, message, colorClass;

  // ---------- SWITCH-CASE: map BMI to a category, message, and color ----------
  switch (true) {
    case bmi < 18.5:
      category = "Underweight";
      colorClass = "underweight";
      message = "Consider a balanced, calorie-sufficient diet and consult the clinic if this persists.";
      break;
    case bmi < 25:
      category = "Normal";
      colorClass = "normal";
      message = "Great! Your BMI is within the healthy range — keep up your current habits.";
      break;
    case bmi < 30:
      category = "Overweight";
      colorClass = "overweight";
      message = "Consider more physical activity and mindful eating. Small changes add up.";
      break;
    default:
      category = "Obese";
      colorClass = "obese";
      message = "We recommend consulting a healthcare provider for personalized guidance.";
  }

  runSubmitAnimation(() => {
    showResult(bmi, category, message, colorClass);

    const record = { name, age, sex, weight, heightCm, bmi, category };
    submissions.unshift(record);
    renderHistory();
    recordSubmission(record);

    form.reset();
    document.querySelectorAll(".field").forEach((f) => f.classList.remove("invalid"));
  });
});

/* ---------- Button loading state (feels like it's really processing) ---------- */

function runSubmitAnimation(onDone) {
  submitBtn.classList.add("loading");
  submitBtn.disabled = true;
  setTimeout(() => {
    submitBtn.classList.remove("loading");
    submitBtn.disabled = false;
    onDone();
  }, 450);
}

/* ---------- Result rendering ---------- */

function showResult(bmi, category, message, colorClass) {
  resultEmpty.style.display = "none";
  resultContent.classList.remove("hidden");

  resultCategory.className = `result-category-pill ${colorClass}`;
  resultCategory.textContent = category;
  resultMessage.textContent = message;

  animateCountUp(resultBmiValue, bmi);

  const clampedBmi = Math.min(Math.max(bmi, GAUGE_MIN), GAUGE_MAX);
  const positionPct = ((clampedBmi - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100;
  requestAnimationFrame(() => {
    gaugeMarker.style.left = `${positionPct}%`;
  });

  saveStatus.textContent = "Saving to kiosk log…";
  saveStatus.classList.remove("saved");
}

function animateCountUp(el, target) {
  const duration = 500;
  const start = performance.now();

  function frame(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = (target * eased).toFixed(1);
    if (progress < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

resetBtn.addEventListener("click", function () {
  resultContent.classList.add("hidden");
  resultEmpty.style.display = "block";
  document.getElementById("name").focus();
});

/* ---------- LOOP: forEach renders the running list of past submissions ---------- */

function renderHistory() {
  historyCount.textContent = submissions.length;

  if (submissions.length === 0) {
    historyEmpty.style.display = "flex";
    return;
  }
  historyEmpty.style.display = "none";

  historyList.querySelectorAll(".history-entry").forEach((el) => el.remove());

  submissions.forEach((entry) => {
    const li = document.createElement("li");
    li.className = "history-entry";

    const main = document.createElement("span");
    main.className = "history-main";
    main.innerHTML = `
      <span class="history-avatar">${getInitials(entry.name)}</span>
      <span class="history-text">
        <span class="history-name">${escapeHtml(entry.name)}</span>
        <span class="history-meta">BMI ${entry.bmi.toFixed(1)}</span>
      </span>
    `;

    const badge = document.createElement("span");
    badge.className = `history-badge ${entry.category.toLowerCase()}`;
    badge.textContent = entry.category;

    li.appendChild(main);
    li.appendChild(badge);
    historyList.appendChild(li);
  });
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

/* ---------- Send the submission to the Google Apps Script Web App ---------- */

function recordSubmission(record) {
  if (!WEB_APP_URL || WEB_APP_URL === "YOUR_WEB_APP_URL") {
    console.warn("WEB_APP_URL is not set yet — skipping Google Sheets recording.");
    saveStatus.textContent = "Not connected to a sheet yet — add your Web App URL in script.js.";
    return;
  }

  fetch(WEB_APP_URL, {
    method: "POST",
    body: JSON.stringify(record),
  })
    .then(() => {
      saveStatus.textContent = "Saved to kiosk log";
      saveStatus.classList.add("saved");
      showToast("Entry recorded to the wellness log");
    })
    .catch((err) => {
      console.error("Could not record submission:", err);
      saveStatus.textContent = "Could not reach the log — recorded locally only.";
    });
}

/* ---------- Toast ---------- */

let toastTimer;
function showToast(text) {
  clearTimeout(toastTimer);
  toast.textContent = text;
  toast.classList.add("show");
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}