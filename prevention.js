const preventionForm = document.getElementById("prevention-form");
const uvIndexInput = document.getElementById("uv-index-input");

const preventionPlaceholder = document.getElementById("prevention-placeholder");
const preventionResults = document.getElementById("prevention-results");

const summaryUvValue = document.getElementById("summary-uv-value");
const summaryRiskLevel = document.getElementById("summary-risk-level");
const summaryRiskPill = document.getElementById("summary-risk-pill");
const summaryMessage = document.getElementById("summary-message");
const preventionUvCircle = document.getElementById("prevention-uv-circle");

const spfValue = document.getElementById("spf-value");
const dosageValue = document.getElementById("dosage-value");
const pumpValue = document.getElementById("pump-value");
const reapplyValue = document.getElementById("reapply-value");
const dosageNote = document.getElementById("dosage-note");

const clothingList = document.getElementById("clothing-list");

const reminderInterval = document.getElementById("reminder-interval");
const addReminderBtn = document.getElementById("add-reminder-btn");
const clearRemindersBtn = document.getElementById("clear-reminders-btn");
const reminderStatus = document.getElementById("reminder-status");
const reminderList = document.getElementById("reminder-list");
const reminderBanner = document.getElementById("reminder-banner");

let currentPlan = null;
let reminders = JSON.parse(localStorage.getItem("sunSafeReminders")) || [];

function getPreventionPlan(uv) {
  if (uv < 3) {
    return {
      label: "Low",
      colorClass: "uv-low",
      message: "Low UV. Basic protection is still recommended, especially if you stay outside for a long time.",
      spf: "SPF 30+",
      teaspoons: "1 teaspoon",
      pumps: "2 pumps",
      reapplyMinutes: 120,
      dosageNote:
        "A small amount is enough for low UV, but cover exposed skin properly.",
      clothing: [
        "Wear sunglasses if the sunlight feels strong.",
        "A light shirt and cap are helpful for outdoor comfort.",
        "Use shade if you are outside for extended periods."
      ]
    };
  }

  if (uv < 6) {
    return {
      label: "Moderate",
      colorClass: "uv-moderate",
      message: "Moderate UV. Protection is recommended before heading outdoors.",
      spf: "SPF 50+",
      teaspoons: "1.5 teaspoons",
      pumps: "3 pumps",
      reapplyMinutes: 120,
      dosageNote:
        "Use enough sunscreen to cover exposed areas like face, neck, arms, and legs.",
      clothing: [
        "Wear a broad-brim hat instead of a cap if possible.",
        "Use sunglasses with UV protection.",
        "Choose a light long-sleeved shirt if you plan to stay outside."
      ]
    };
  }

  if (uv < 8) {
    return {
      label: "High",
      colorClass: "uv-high",
      message: "High UV. Protection is needed now before outdoor exposure.",
      spf: "SPF 50+",
      teaspoons: "2 teaspoons",
      pumps: "4 pumps",
      reapplyMinutes: 90,
      dosageNote:
        "Apply sunscreen generously to all exposed skin. Reapply sooner if sweating or wiping skin.",
      clothing: [
        "Wear lightweight long sleeves or sun-protective clothing.",
        "Use a broad-brim hat for face, neck, and ear coverage.",
        "Wear UV-protective sunglasses.",
        "Seek shade where possible."
      ]
    };
  }

  if (uv < 11) {
    return {
      label: "Very High",
      colorClass: "uv-very-high",
      message: "Very high UV. Extra protection is needed and outdoor exposure should be limited.",
      spf: "SPF 50+",
      teaspoons: "2.5 teaspoons",
      pumps: "5 pumps",
      reapplyMinutes: 80,
      dosageNote:
        "Use a generous amount of sunscreen and cover exposed skin carefully before going out.",
      clothing: [
        "Wear long sleeves or UPF-rated clothing.",
        "Choose a broad-brim hat rather than a cap.",
        "Use wraparound sunglasses.",
        "Stay in deep shade whenever possible.",
        "Avoid long outdoor exposure around midday."
      ]
    };
  }

  return {
    label: "Extreme",
    colorClass: "uv-extreme",
    message: "Extreme UV. Avoid direct sun exposure if possible and protect all exposed skin immediately.",
    spf: "SPF 50+",
    teaspoons: "3 teaspoons",
    pumps: "6 pumps",
    reapplyMinutes: 60,
    dosageNote:
      "Extreme UV requires maximum coverage. Apply sunscreen generously and do not rely on one quick application.",
    clothing: [
      "Wear full protective clothing with maximum skin coverage.",
      "Use a broad-brim hat and UV-protective sunglasses.",
      "Seek deep shade or stay indoors during peak hours.",
      "Delay outdoor activity if possible."
    ]
  };
}

function resetRiskClasses() {
  preventionUvCircle.classList.remove(
    "uv-low",
    "uv-moderate",
    "uv-high",
    "uv-very-high",
    "uv-extreme"
  );

  summaryRiskPill.classList.remove(
    "uv-low",
    "uv-moderate",
    "uv-high",
    "uv-very-high",
    "uv-extreme"
  );
}

function renderClothing(clothingItems) {
  clothingList.innerHTML = "";

  clothingItems.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    clothingList.appendChild(li);
  });
}

function renderPreventionPlan(uv, sourceText = "") {
  const plan = getPreventionPlan(uv);
  currentPlan = {
    uv,
    ...plan
  };

  preventionPlaceholder.classList.add("prevention-hidden");
  preventionResults.classList.remove("prevention-hidden");

  summaryUvValue.textContent = Number(uv).toFixed(1);
  summaryRiskLevel.textContent = `${plan.label} Risk`;
  summaryRiskPill.textContent = plan.label;
  summaryMessage.textContent = sourceText
    ? `${plan.message} ${sourceText}`
    : plan.message;

  spfValue.textContent = plan.spf;
  dosageValue.textContent = plan.teaspoons;
  pumpValue.textContent = plan.pumps;
  reapplyValue.textContent = `${plan.reapplyMinutes} minutes`;
  dosageNote.textContent = plan.dosageNote;

  renderClothing(plan.clothing);

  resetRiskClasses();
  preventionUvCircle.classList.add(plan.colorClass);
  summaryRiskPill.classList.add(plan.colorClass);

  reminderInterval.value = String(plan.reapplyMinutes);
  reminderStatus.textContent = `Recommended reminder time selected: every ${plan.reapplyMinutes} minutes.`;
}

function loadLatestUvResult() {
  const stored = localStorage.getItem("latestUvResult");
  if (!stored) return;

  try {
    const latestUv = JSON.parse(stored);

    if (latestUv && typeof latestUv.uv === "number") {
      uvIndexInput.value = latestUv.uv;

      const sourceText = `Based on your latest UV Checker result for ${latestUv.location}.`;
      renderPreventionPlan(latestUv.uv, sourceText);

      reminderStatus.textContent = `Loaded latest UV result from UV Checker: ${latestUv.location}.`;
    }
  } catch (error) {
    console.error("Could not load latest UV result:", error);
  }
}

function saveReminders() {
  localStorage.setItem("sunSafeReminders", JSON.stringify(reminders));
}

function formatDateTime(timestamp) {
  return new Date(timestamp).toLocaleString();
}

function renderReminders() {
  reminderList.innerHTML = "";

  if (reminders.length === 0) {
    reminderList.innerHTML = `<li class="empty-reminder">No reminders set yet.</li>`;
    return;
  }

  reminders.forEach((reminder) => {
    const li = document.createElement("li");
    li.className = "reminder-item";

    li.innerHTML = `
      <div class="reminder-item-text">
        <strong>${reminder.title}</strong>
        <span>Every ${reminder.intervalMinutes} minutes</span>
        <span>Next reminder: ${formatDateTime(reminder.nextDue)}</span>
      </div>
      <button type="button" class="remove-reminder-btn" data-id="${reminder.id}">
        Remove
      </button>
    `;

    reminderList.appendChild(li);
  });
}

function showReminderBanner(message) {
  reminderBanner.textContent = message;
  reminderBanner.classList.remove("prevention-hidden");

  clearTimeout(showReminderBanner.timeoutId);
  showReminderBanner.timeoutId = setTimeout(() => {
    reminderBanner.classList.add("prevention-hidden");
  }, 5000);
}

function sendReminderNotification(message) {
  showReminderBanner(message);

  if ("Notification" in window) {
    if (Notification.permission === "granted") {
      new Notification("SunSafe Reminder", {
        body: message
      });
    }
  }
}

function requestNotificationPermission() {
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission().catch(() => {});
  }
}

function addReminder() {
  if (!currentPlan) {
    reminderStatus.textContent = "Generate a prevention plan before adding reminders.";
    return;
  }

  const intervalMinutes = Number(reminderInterval.value);

  const reminder = {
    id: Date.now(),
    title: `${currentPlan.label} UV Reapply Reminder`,
    intervalMinutes,
    nextDue: Date.now() + intervalMinutes * 60 * 1000,
    message: `Time to reapply sunscreen. UV ${Number(currentPlan.uv).toFixed(1)} is currently ${currentPlan.label.toLowerCase()}.`
  };

  reminders.push(reminder);
  saveReminders();
  renderReminders();
  requestNotificationPermission();

  reminderStatus.textContent = `Reminder added successfully for every ${intervalMinutes} minutes.`;
}

function clearAllReminders() {
  reminders = [];
  saveReminders();
  renderReminders();
  reminderStatus.textContent = "All reminders were removed.";
}

function removeReminder(id) {
  reminders = reminders.filter((reminder) => reminder.id !== id);
  saveReminders();
  renderReminders();
  reminderStatus.textContent = "Reminder removed.";
}

function checkReminderSchedule() {
  const now = Date.now();
  let updated = false;

  reminders.forEach((reminder) => {
    if (now >= reminder.nextDue) {
      sendReminderNotification(reminder.message);
      reminder.nextDue = now + reminder.intervalMinutes * 60 * 1000;
      updated = true;
    }
  });

  if (updated) {
    saveReminders();
    renderReminders();
  }
}

preventionForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const uv = Number(uvIndexInput.value);

  if (Number.isNaN(uv) || uv < 0 || uv > 15) {
    reminderStatus.textContent = "Please enter a valid UV Index between 0 and 15.";
    return;
  }

  renderPreventionPlan(uv);
});

addReminderBtn?.addEventListener("click", addReminder);

clearRemindersBtn?.addEventListener("click", clearAllReminders);

reminderList?.addEventListener("click", (event) => {
  if (event.target.classList.contains("remove-reminder-btn")) {
    const id = Number(event.target.dataset.id);
    removeReminder(id);
  }
});

renderReminders();
loadLatestUvResult();
setInterval(checkReminderSchedule, 30000);