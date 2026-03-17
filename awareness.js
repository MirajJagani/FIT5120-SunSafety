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

const skinTypeContent = {
  all: {
    title: "All skin tones need sun protection",
    text: "Some people burn faster than others, but UV still affects every skin type. Sun safety is not only for fair skin.",
    points: [
      "Check the UV Index rather than guessing from temperature.",
      "Use sunscreen, shade, sunglasses, and protective clothing.",
      "Do not assume tanning means your skin is safe or healthy."
    ]
  },
  lighter: {
    title: "Lighter skin may burn more quickly",
    text: "Lighter skin usually has lower melanin, so it can burn faster in strong UV. That means protection often needs to happen earlier and more consistently.",
    points: [
      "Use broad-spectrum SPF 50 or 50+ sunscreen.",
      "Cover up with protective clothing and a hat.",
      "Seek shade during high UV periods."
    ]
  },
  medium: {
    title: "Medium skin still needs consistent UV protection",
    text: "Medium skin may not always show damage as quickly as lighter skin, but UV can still cause long-term harm, tanning damage, and early ageing.",
    points: [
      "Do not rely on skin tone alone to judge risk.",
      "Check the UV Index before outdoor activities.",
      "Use sunscreen and sunglasses regularly."
    ]
  },
  darker: {
    title: "Brown and darker skin still need sun protection",
    text: "Higher melanin can offer some natural protection, but it does not completely block UV damage. Darker skin can still experience damage, pigmentation changes, and skin cancer risk.",
    points: [
      "Do not assume darker skin is immune to UV.",
      "Use sunscreen on exposed skin when UV is high.",
      "Protect your eyes and seek shade during peak UV times."
    ]
  }
};

const skinTypeButtons = document.querySelectorAll(".skin-type-btn");
const skinPanelTitle = document.getElementById("skin-panel-title");
const skinPanelText = document.getElementById("skin-panel-text");
const skinPanelList = document.getElementById("skin-panel-list");

skinTypeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    skinTypeButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    const selectedSkin = button.dataset.skin;
    const content = skinTypeContent[selectedSkin];

    skinPanelTitle.textContent = content.title;
    skinPanelText.textContent = content.text;
    skinPanelList.innerHTML = "";

    content.points.forEach((point) => {
      const li = document.createElement("li");
      li.textContent = point;
      skinPanelList.appendChild(li);
    });
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

  if (score === 4) {
    quizResult.textContent = `Awesome! You scored ${score}/4.`;
  } else if (score >= 2) {
    quizResult.textContent = `Nice work! You scored ${score}/4.`;
  } else {
    quizResult.textContent = `You scored ${score}/4. Review the myths and skin-tone guide, then try again.`;
  }
});