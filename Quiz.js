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

let currentQuestionIndex = 0;
const selectedAnswers = new Array(questions.length).fill(null);

const questionLabel = document.querySelector(".question-label");
const questionTitle = document.querySelector(".quiz-card h2");
const optionsContainer = document.querySelector(".options");
const prevButton = document.querySelector(".btn-secondary");
const nextButton = document.querySelector(".btn-primary");
const progressFill = document.querySelector(".progress-fill");
const progressText = document.querySelector(".progress-top span:last-child");

function renderQuestion() {
  const currentQuestion = questions[currentQuestionIndex];

  questionLabel.textContent = `Question ${currentQuestionIndex + 1}`;
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
    });

    const span = document.createElement("span");
    span.textContent = option.text;

    label.appendChild(input);
    label.appendChild(span);
    optionsContainer.appendChild(label);
  });

  updateProgress();
  updateButtons();
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

  if (currentQuestionIndex === questions.length - 1) {
    nextButton.textContent = "Submit Quiz";
  } else {
    nextButton.textContent = "Next Question";
  }
}

function calculateResult() {
  let totalScore = 0;

  selectedAnswers.forEach((answerIndex, questionIndex) => {
    if (answerIndex !== null) {
      totalScore += questions[questionIndex].options[answerIndex].score;
    }
  });

  let riskLevel = "Low";
  let advice = "Great job. Your sun protection habits are strong. Keep checking UV levels and maintaining daily protection.";

  if (totalScore >= 6) {
    riskLevel = "High";
    advice = "Your current habits suggest a high sun exposure risk. Use SPF 50+ sunscreen, wear protective clothing, and avoid peak UV hours.";
  } else if (totalScore >= 3) {
    riskLevel = "Moderate";
    advice = "You have some good habits, but your protection can improve. Try applying sunscreen more consistently and seeking shade.";
  }

  return {
    score: totalScore,
    risk: riskLevel,
    advice: advice
  };
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

    localStorage.setItem("quizResult", JSON.stringify(result));

    alert(
      `Quiz Complete!\n\nRisk Level: ${result.risk}\nScore: ${result.score}\n\n${result.advice}`
    );

    // 后面你要跳转可以打开这行
    // window.location.href = "awareness.html";
  }
});

renderQuestion();