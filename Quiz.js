const questions = [
  {
    type: "habit",
    question: "How often do you apply sunscreen before going outside?",
    options: [
      { text: "Always", habitRisk: 0 },
      { text: "Sometimes", habitRisk: 1 },
      { text: "Rarely", habitRisk: 2 },
      { text: "Never", habitRisk: 3 }
    ]
  },
  {
    type: "habit",
    question: "What time of day are you usually outside the longest?",
    options: [
      { text: "Before 10am", habitRisk: 0 },
      { text: "10am - 12pm", habitRisk: 1 },
      { text: "12pm - 3pm", habitRisk: 3 },
      { text: "After 3pm", habitRisk: 1 }
    ]
  },
  {
    type: "habit",
    question: "Do you usually wear a hat or protective clothing in the sun?",
    options: [
      { text: "Always", habitRisk: 0 },
      { text: "Sometimes", habitRisk: 1 },
      { text: "Rarely", habitRisk: 2 },
      { text: "Never", habitRisk: 3 }
    ]
  },
  {
    type: "knowledge",
    question: "In Australia, when is sun protection generally recommended?",
    options: [
      { text: "Only when it feels hot", isCorrect: false },
      { text: "When UV is 3 or above", isCorrect: true },
      { text: "Only during summer holidays", isCorrect: false },
      { text: "Only after 12pm", isCorrect: false }
    ]
  },
  {
    type: "knowledge",
    question: "Which age group was least likely to use adequate sun protection in the 2023–24 survey?",
    options: [
      { text: "15–24 years", isCorrect: true },
      { text: "35–44 years", isCorrect: false },
      { text: "45–54 years", isCorrect: false },
      { text: "65+ years", isCorrect: false }
    ]
  },
  {
    type: "knowledge",
    question: "Which statement about skin cancer in Australia is true?",
    options: [
      { text: "Non-melanoma skin cancer is one of the rarest cancers", isCorrect: false },
      { text: "It only affects fair skin", isCorrect: false },
      { text: "Non-melanoma skin cancer is the most common cancer diagnosed in Australia", isCorrect: true },
      { text: "UV damage only matters on very hot days", isCorrect: false }
    ]
  }
];

let currentQuestionIndex = 0;
const selectedAnswers = new Array(questions.length).fill(null);

const questionLabel = document.querySelector(".question-label");
const questionType = document.getElementById("questionType");
const questionTitle = document.querySelector(".quiz-card h2");
const optionsContainer = document.querySelector(".options");

const prevButton = document.querySelector(".btn-secondary");
const nextButton = document.querySelector(".btn-primary");

const progressFill = document.querySelector(".progress-fill");
const progressText = document.getElementById("progressText");

const habitScoreValue = document.getElementById("habitScoreValue");
const habitScoreText = document.getElementById("habitScoreText");
const knowledgeScoreValue = document.getElementById("knowledgeScoreValue");
const knowledgeScoreText = document.getElementById("knowledgeScoreText");

const quizResult = document.getElementById("quizResult");
const resultText = document.getElementById("resultText");

function getHabitScore() {
  let total = 0;

  selectedAnswers.forEach((answerIndex, questionIndex) => {
    if (answerIndex === null) return;

    const question = questions[questionIndex];
    if (question.type === "habit") {
      total += question.options[answerIndex].habitRisk;
    }
  });

  return total;
}

function getKnowledgeScore() {
  let total = 0;

  selectedAnswers.forEach((answerIndex, questionIndex) => {
    if (answerIndex === null) return;

    const question = questions[questionIndex];
    if (question.type === "knowledge" && question.options[answerIndex].isCorrect) {
      total += 1;
    }
  });

  return total;
}

function updateScoreDisplay() {
  const habitScore = getHabitScore();
  const knowledgeScore = getKnowledgeScore();

  habitScoreValue.textContent = habitScore;
  knowledgeScoreValue.textContent = knowledgeScore;

  if (habitScore >= 6) {
    habitScoreText.textContent = "Your current outdoor habits suggest a higher UV protection risk.";
  } else if (habitScore >= 3) {
    habitScoreText.textContent = "Your habits are mixed. Some areas of sun protection could improve.";
  } else {
    habitScoreText.textContent = "Your current sun-protection habits look fairly strong.";
  }

  if (knowledgeScore === 3) {
    knowledgeScoreText.textContent = "Your Australian UV awareness knowledge looks strong.";
  } else if (knowledgeScore === 2) {
    knowledgeScoreText.textContent = "Your UV knowledge is good, but there is still room to improve.";
  } else {
    knowledgeScoreText.textContent = "You may need a stronger understanding of Australian UV facts.";
  }
}

function renderQuestion() {
  const currentQuestion = questions[currentQuestionIndex];

  questionLabel.textContent = `Question ${currentQuestionIndex + 1}`;
  questionType.textContent = currentQuestion.type === "habit" ? "Habit Question" : "Knowledge Question";
  questionTitle.textContent = currentQuestion.question;

  optionsContainer.innerHTML = "";

  currentQuestion.options.forEach((option, optionIndex) => {
    const label = document.createElement("label");
    label.className = "option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = `question-${currentQuestionIndex}`;
    input.value = optionIndex;

    if (selectedAnswers[currentQuestionIndex] === optionIndex) {
      input.checked = true;
      label.style.borderColor = "#ff8a2b";
    }

    input.addEventListener("change", () => {
      selectedAnswers[currentQuestionIndex] = optionIndex;

      document.querySelectorAll(".option").forEach((item) => {
        item.style.borderColor = "#f0dfd3";
      });

      label.style.borderColor = "#ff8a2b";
      updateScoreDisplay();
    });

    const span = document.createElement("span");
    span.textContent = option.text;

    label.appendChild(input);
    label.appendChild(span);
    optionsContainer.appendChild(label);
  });

  updateProgress();
  updateButtons();
  updateScoreDisplay();
}

function updateProgress() {
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;
  progressFill.style.width = `${progressPercentage}%`;
  progressText.textContent = `Question ${currentQuestionIndex + 1} of ${questions.length}`;
}

function updateButtons() {
  prevButton.disabled = currentQuestionIndex === 0;
  prevButton.style.opacity = currentQuestionIndex === 0 ? "0.5" : "1";
  prevButton.style.cursor = currentQuestionIndex === 0 ? "not-allowed" : "pointer";
  nextButton.textContent = currentQuestionIndex === questions.length - 1 ? "Submit Quiz" : "Next Question";
}

function getHabitRiskLabel(score) {
  if (score >= 6) return "High";
  if (score >= 3) return "Moderate";
  return "Low";
}

function getKnowledgeLabel(score) {
  if (score === 3) return "Strong";
  if (score === 2) return "Good";
  return "Needs Improvement";
}

function buildPersonalisedGuidance(habitScore, knowledgeScore) {
  const guidance = [];

  const sunscreenAnswer = selectedAnswers[0];
  const timingAnswer = selectedAnswers[1];
  const clothingAnswer = selectedAnswers[2];
  const uvQuestion = selectedAnswers[3];
  const youngAdultQuestion = selectedAnswers[4];
  const cancerQuestion = selectedAnswers[5];

  if (sunscreenAnswer === 2 || sunscreenAnswer === 3) {
    guidance.push("You should strengthen sunscreen habits before going outside. Visit Prevention for dosage guidance and reminders.");
  }

  if (timingAnswer === 2) {
    guidance.push("You are outdoors during peak UV hours. Use the UV Checker before going out and try to limit midday exposure.");
  }

  if (clothingAnswer === 2 || clothingAnswer === 3) {
    guidance.push("You may need stronger clothing protection. Prevention can help with hats, sunglasses, and clothing recommendations.");
  }

  if (uvQuestion !== 1) {
    guidance.push("Review the Awareness page: in Australia, sun protection is generally recommended when UV is 3 or above.");
  }

  if (youngAdultQuestion !== 0) {
    guidance.push("Young adults are one of the least protected age groups. Keep that in mind when planning outdoor activities.");
  }

  if (cancerQuestion !== 2) {
    guidance.push("Australia’s skin cancer burden is serious. The Awareness page can help explain why regular protection matters.");
  }

  if (habitScore <= 2 && knowledgeScore === 3) {
    guidance.push("Your habits and awareness are strong. Keep checking UV conditions and staying consistent.");
  }

  if (!guidance.some((item) => item.includes("UV Checker"))) {
    guidance.push("Check your local UV on the UV Checker before outdoor activities.");
  }

  return guidance;
}

function calculateResult() {
  const habitScore = getHabitScore();
  const knowledgeScore = getKnowledgeScore();

  const result = {
    habitScore,
    knowledgeScore,
    habitRisk: getHabitRiskLabel(habitScore),
    knowledgeLevel: getKnowledgeLabel(knowledgeScore),
    personalisedGuidance: buildPersonalisedGuidance(habitScore, knowledgeScore)
  };

  localStorage.setItem("quizResult", JSON.stringify(result));
  return result;
}

function showResult(result) {
  quizResult.style.display = "block";

  const guidanceHtml = result.personalisedGuidance
    .map((item) => `<li>${item}</li>`)
    .join("");

  resultText.innerHTML = `
    <p><strong>Protection Habit Score:</strong> ${result.habitScore}/9 (${result.habitRisk} Risk)</p>
    <p><strong>UV Knowledge Score:</strong> ${result.knowledgeScore}/3 (${result.knowledgeLevel})</p>

    <ul class="result-list">
      ${guidanceHtml}
    </ul>

    <div class="result-links">
      <a href="uv-checker.html" class="btn btn-secondary">Go to UV Checker</a>
      <a href="prevention.html" class="btn btn-primary">Go to Prevention</a>
    </div>
  `;

  prevButton.style.display = "none";
  nextButton.style.display = "none";
}

prevButton.addEventListener("click", () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
  }
});

nextButton.addEventListener("click", () => {
  if (selectedAnswers[currentQuestionIndex] === null) {
    alert("Please select an answer before continuing.");
    return;
  }

  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  } else {
    const result = calculateResult();
    showResult(result);
  }
});

renderQuestion();
updateScoreDisplay();