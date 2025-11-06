console.log("Script loaded successfully.");

let questions = [];
let userAnswers = [];

// statisk timer–variabel (för framtida användning)
// let timeLeft = 600; // 2 minuter t.ex.

const countdownDisplay = document.getElementById("countdown-display");
const startButton = document.getElementById("start-button");

const TOTAL_TIME_SECONDS = 600; // totala tid

let countdownTime = TOTAL_TIME_SECONDS; //nuvarande tid
let countdownInterval; //kontroll nyckel, stoppar timern och gör så att man kan börja om
const QUESTION_LIMIT = 2;

//Timer**
function formatTime(totalSeconds) {
  //totalSeconds
  const minutes = Math.floor(totalSeconds / 60); //visar minuter
  const seconds = totalSeconds % 60; //visar återstende sekunder

  const formattedMinutes = minutes.toString().padStart(2, "0"); //gör så att den alltid visar två siffror minuter, ex 9 min visar 09 på timern
  const formattedSeconds = seconds.toString().padStart(2, "0"); //gör så att den alltid visar två siffror sekunder, ex 9 sek visar 09 på timern

  return `${formattedMinutes}:${formattedSeconds}`;
}

function updateCountdown() {
  countdownTime--; //Förkortning för variabel - 1, gör att sekundrarna räknas ner en sek i taget.

  countdownDisplay.textContent = formatTime(countdownTime); //Kallar på formatTime funktionen och visar nedräkningen per sekund i div texten.

  if (countdownTime <= 0) {
    clearInterval(countdownInterval); //Stoppar och rensar intervallet, tillåter att den kan börjar om igen.
    countdownDisplay.textContent = "Tiden är ute! Vill du börja om?"; //Visar text stringen när timern tagit slut.
    startButton.style.display = ""; //Återaktiverar knappen så att timern kan räkna ner igen.
    startButton.textContent = "Börja om";
    countdownTime = TOTAL_TIME_SECONDS; //Återställer till 10 min.
  }
}

function startCountdown() {
  clearInterval(countdownInterval);
  countdownTime = TOTAL_TIME_SECONDS; //Återställer timern.
  startButton.style.display = "none"; //Gömmer start knappen
  countdownDisplay.textContent = formatTime(countdownTime); //Kallar på formatTime funktionen och visar nedräkningen per sekund i div texten.
  countdownInterval = setInterval(updateCountdown, 1000); //1000 behövs för att det faktist ska gå en sekund mellan varje ändring.
}

startButton.addEventListener("click", startCountdown);

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

    // if-sats ska bort eftråt då den endast visar i konsolen om svaret var rätt eller fel.
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
  clearInterval(countdownInterval);

  let correctCount = 0;
  questions.forEach((q, i) => {
    if (userAnswers[i] === q.answers[q.correct]) correctCount++;
  });

  const resultContainer = document.getElementById("result-container");
  resultContainer.classList.remove("hidden");

  console.log(countdownTime);
  const timeUsed = `${Math.floor((TOTAL_TIME_SECONDS - countdownTime) / 60)} min ${(TOTAL_TIME_SECONDS - countdownTime) % 60} sek`;
  const timeRemaining = `${Math.floor(countdownTime / 60)} min ${countdownTime % 60} sek`;

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
    timeRemaining: timeRemaining,
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
