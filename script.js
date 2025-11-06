console.log("Script loaded successfully.");

let questions = [];
let userAnswers = [];

// statisk timer–variabel (för framtida användning)
let timeLeft = 600; // 2 minuter t.ex.

const QUESTION_LIMIT = 20;

async function getQuizQuestions() {
  try {
    const response = await fetch("questions.json");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const shuffledData = shuffle(data);
    const limitedQuestions = shuffledData.slice(0, QUESTION_LIMIT);

    return limitedQuestions;

  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}

function shuffle(arr) {
  let lastQuestion = arr.length - 1;
  while (lastQuestion > 0) {
    const randQuestion = Math.floor(Math.random() * (lastQuestion + 1));
    [arr[lastQuestion], arr[randQuestion]] = [arr[randQuestion], arr[lastQuestion]];
    lastQuestion -= 1;
  }
  return arr;
}

async function renderHTML(questionsData) {
  questions = questionsData;
  userAnswers = [];

  const question = document.getElementById("question");
  const answerOne = document.getElementById("answer-one");
  const answerTwo = document.getElementById("answer-two");
  const answerThree = document.getElementById("answer-three");
  const answerFour = document.getElementById("answer-four");

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    question.innerText = q.question;
    answerOne.innerText = q.answers[0];
    answerTwo.innerText = q.answers[1];
    answerThree.innerText = q.answers[2];
    answerFour.innerText = q.answers[3];

    const userAnswer = await waitForAnswer([answerOne, answerTwo, answerThree, answerFour]);
    userAnswers.push(userAnswer);

    if (userAnswer === q.answers[q.correct]) {
      console.log("Korrekt!");
    } else {
      console.log("Fel!");
    }
  }

  endQuiz(); // Kör när alla frågor är besvarade
}

function waitForAnswer(answerElements) {
  return new Promise((resolve) => {
    answerElements.forEach((btn) => {
      const handleClick = () => {
        answerElements.forEach((b) => b.removeEventListener("click", handleClick));
        resolve(btn.innerText);
      };
      btn.addEventListener("click", handleClick);
    });
  });
}


// Avsluta quiz och räkna resultat
// ============================
function endQuiz(timeOut = false) {
  // --- Timer bortkommenterad tills vidare ---
  // clearInterval(timer);

  let correctCount = 0;
  questions.forEach((q, i) => {
    if (userAnswers[i] === q.answers[q.correct]) correctCount++;
  });

  const resultContainer = document.getElementById("result-container");
  resultContainer.classList.remove("hidden");

  const timeUsed = "N/A"; // statiskt tills vidare
  const timeRemaining = `${Math.floor(timeLeft / 60)} min ${timeLeft % 60} sek`;

  document.getElementById("score").innerHTML = `
    <strong>Du fick ${correctCount} av ${questions.length} rätt!</strong><br>
    ${timeOut ? "⏰ Tiden tog slut!" : ""}
    <br><br>
    <strong>Tid använd:</strong> ${timeUsed}<br>
    <strong>Tid kvar:</strong> ${timeRemaining}
  `;

  // Spara resultat i LocalStorage
  const previousResults = JSON.parse(localStorage.getItem("quizResults")) || [];
  previousResults.push({
    date: new Date().toLocaleString(),
    score: correctCount,
    total: questions.length,
    timeUsed: timeUsed,
    timeRemaining: timeRemaining
  });
  localStorage.setItem("quizResults", JSON.stringify(previousResults));
}

async function init() {
  const fetchedQuestions = await getQuizQuestions();
  if (fetchedQuestions.length > 0) {
    renderHTML(fetchedQuestions);
  } else {
    console.error("Inga frågor kunde hämtas.");
  }
}

init();
