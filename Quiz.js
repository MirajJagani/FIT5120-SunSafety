// ===============================
// Quiz Question Data
// Each option has a score value.
// Higher score = higher sun exposure risk
// ===============================
const questions = [
  {
    question: "How often do you apply sunscreen before going outside?",
    options: [
      { text: "Always", score: 0 },
      { text: "Sometimes", score: 1 },
      { text: "Rarely", score: 2 },
      { text: "Never", score: 3 }
    ]
  },
  {
    question: "What time of day are you usually outside the longest?",
    options: [
      { text: "Before 10am", score: 0 },
      { text: "10am - 12pm", score: 1 },
      { text: "12pm - 3pm", score: 3 },
      { text: "After 3pm", score: 1 }
    ]
  },
  {
    question: "Do you usually wear a hat or protective clothing in the sun?",
    options: [
      { text: "Always", score: 0 },
      { text: "Sometimes", score: 1 },
      { text: "Rarely", score: 2 },
      { text: "Never", score: 3 }
    ]
  }
];

// ===============================
// Quiz State Variables
// ===============================

// Index of the currently displayed question
let currentQuestionIndex = 0;

// Store selected answer index for each question
const selectedAnswers = new Array(questions.length).fill(null);

// ===============================
// DOM Elements
// ===============================

const questionLabel = document.querySelector(".question-label");
const questionTitle = document.querySelector(".quiz-card h2");
const optionsContainer = document.querySelector(".options");

const prevButton = document.querySelector(".btn-secondary");
const nextButton = document.querySelector(".btn-primary");

const progressFill = document.querySelector(".progress-fill");
const progressText = document.querySelector(".progress-top span:last-child");

// Score display elements (added in HTML)
const scoreValue = document.getElementById("scoreValue");
const scoreText = document.getElementById("scoreText");

// Final result display area
const quizResult = document.getElementById("quizResult");
const resultText = document.getElementById("resultText");


// ===============================
// Function: Calculate Current Score
// Calculates score based on selected answers
// ===============================
function getCurrentScore() {
  let totalScore = 0;

  selectedAnswers.forEach((answerIndex, questionIndex) => {
    if (answerIndex !== null) {
      totalScore += questions[questionIndex].options[answerIndex].score;
    }
  });

  return totalScore;
}


// ===============================
// Function: Update Score Display
// Shows the current score on the quiz page
// ===============================
function updateScoreDisplay() {

  const currentScore = getCurrentScore();
  scoreValue.textContent = currentScore;

  const answeredCount = selectedAnswers.filter(a => a !== null).length;

  // Provide simple feedback based on answers
  if (answeredCount === 0) {
    scoreText.textContent =
      "Answer the questions to see your sun safety score.";
  } else if (answeredCount < questions.length) {
    scoreText.textContent =
      `You have answered ${answeredCount} of ${questions.length} questions.`;
  } else {

    if (currentScore >= 6) {
      scoreText.textContent =
        "Your answers suggest a higher sun exposure risk.";
    } else if (currentScore >= 3) {
      scoreText.textContent =
        "Your answers suggest a moderate sun exposure risk.";
    } else {
      scoreText.textContent =
        "Your answers suggest a low sun exposure risk.";
    }

  }
}


// ===============================
// Function: Render Question
// Displays the current question and options
// ===============================
function renderQuestion() {

  const currentQuestion = questions[currentQuestionIndex];

  questionLabel.textContent = `Question ${currentQuestionIndex + 1}`;
  questionTitle.textContent = currentQuestion.question;

  optionsContainer.innerHTML = "";

  // Generate option elements
  currentQuestion.options.forEach((option, optionIndex) => {

    const label = document.createElement("label");
    label.className = "option";

    const input = document.createElement("input");
    input.type = "radio";
    input.name = `question-${currentQuestionIndex}`;
    input.value = optionIndex;

    // Restore previously selected answer
    if (selectedAnswers[currentQuestionIndex] === optionIndex) {
      input.checked = true;
      label.style.borderColor = "#ff8a2b";
    }

    // Handle option selection
    input.addEventListener("change", () => {

      selectedAnswers[currentQuestionIndex] = optionIndex;

      // Reset option styles
      document.querySelectorAll(".option").forEach((item) => {
        item.style.borderColor = "#f0dfd3";
      });

      label.style.borderColor = "#ff8a2b";

      // Update score when answer changes
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


// ===============================
// Function: Update Progress Bar
// ===============================
function updateProgress() {

  const progressPercentage =
    ((currentQuestionIndex + 1) / questions.length) * 100;

  progressFill.style.width = `${progressPercentage}%`;

  progressText.textContent =
    `Question ${currentQuestionIndex + 1} of ${questions.length}`;
}


// ===============================
// Function: Update Button States
// ===============================
function updateButtons() {

  prevButton.disabled = currentQuestionIndex === 0;

  prevButton.style.opacity =
    currentQuestionIndex === 0 ? "0.5" : "1";

  prevButton.style.cursor =
    currentQuestionIndex === 0 ? "not-allowed" : "pointer";

  if (currentQuestionIndex === questions.length - 1) {
    nextButton.textContent = "Submit Quiz";
  } else {
    nextButton.textContent = "Next Question";
  }
}


// ===============================
// Function: Calculate Final Result
// Determines risk level based on score
// ===============================
function calculateResult() {

  let totalScore = getCurrentScore();

  let riskLevel = "Low";

  let advice =
    "Great job. Your sun protection habits are strong.";

  if (totalScore >= 6) {

    riskLevel = "High";

    advice =
      "Your habits suggest a high sun exposure risk. Use SPF 50+, wear protective clothing, and avoid peak UV hours.";

  } else if (totalScore >= 3) {

    riskLevel = "Moderate";

    advice =
      "You have some good habits, but your protection can improve.";

  }

  return {
    score: totalScore,
    risk: riskLevel,
    advice: advice
  };
}


// ===============================
// Function: Display Final Result
// Shows result directly on the page
// ===============================
function showResult(result) {

  quizResult.style.display = "block";

  resultText.textContent =
    `Risk Level: ${result.risk} | Score: ${result.score}. ${result.advice}`;

  // Disable buttons after submission
  prevButton.style.display = "none";
  nextButton.style.display = "none";
}


// ===============================
// Event: Previous Button
// ===============================
prevButton.addEventListener("click", () => {

  if (currentQuestionIndex > 0) {

    currentQuestionIndex--;

    renderQuestion();

  }

});


// ===============================
// Event: Next / Submit Button
// ===============================
nextButton.addEventListener("click", () => {

  // Ensure an answer is selected
  if (selectedAnswers[currentQuestionIndex] === null) {

    alert("Please select an answer before continuing.");

    return;

  }

  if (currentQuestionIndex < questions.length - 1) {

    currentQuestionIndex++;

    renderQuestion();

  } else {

    // Quiz completed
    const result = calculateResult();

    // Save result to localStorage
    localStorage.setItem("quizResult", JSON.stringify(result));

    // Show result on the page
    showResult(result);

  }

});


// ===============================
// Initialize Quiz
// ===============================
renderQuestion();
updateScoreDisplay();