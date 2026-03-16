document.getElementById("year").textContent = new Date().getFullYear();

const mythCards = document.querySelectorAll(".myth-card");

mythCards.forEach((card) => {
  const toggle = card.querySelector(".toggle");

  card.addEventListener("click", () => {
    const isActive = card.classList.contains("active");

    if (isActive) {
      card.classList.remove("active");
      card.setAttribute("aria-expanded", "false");
      if (toggle) toggle.textContent = "+";
    } else {
      card.classList.add("active");
      card.setAttribute("aria-expanded", "true");
      if (toggle) toggle.textContent = "-";
    }
  });
});

const quizItems = document.querySelectorAll(".quiz-item");

quizItems.forEach((item) => {
  const options = item.querySelectorAll(".quiz-option");

  options.forEach((option) => {
    option.addEventListener("click", () => {
      options.forEach((btn) => {
        btn.classList.remove("selected");
      });
      option.classList.add("selected");
      item.dataset.selected = option.dataset.choice;
    });
  });
});

const checkQuizBtn = document.getElementById("checkQuizBtn");
const quizResult = document.getElementById("quizResult");

checkQuizBtn.addEventListener("click", () => {
  let score = 0;

  quizItems.forEach((item) => {
    const correctAnswer = item.dataset.answer;
    const selectedAnswer = item.dataset.selected;
    const options = item.querySelectorAll(".quiz-option");

    options.forEach((btn) => {
      btn.classList.remove("correct", "wrong");
    });

    options.forEach((btn) => {
      if (btn.dataset.choice === correctAnswer) {
        btn.classList.add("correct");
      }

      if (selectedAnswer && btn.dataset.choice === selectedAnswer && selectedAnswer !== correctAnswer) {
        btn.classList.add("wrong");
      }
    });

    if (selectedAnswer === correctAnswer) {
      score += 1;
    }
  });

  if (score === 3) {
    quizResult.textContent = `Awesome! You scored ${score}/3.`;
  } else if (score === 2) {
    quizResult.textContent = `Nice work! You scored ${score}/3.`;
  } else {
    quizResult.textContent = `You scored ${score}/3. Review the myths and try again.`;
  }
});
