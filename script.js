import { saveResultToLocal, loadResults } from "./quizStorage.js";

console.log("Script loaded successfully.");

let questions = [];
let userAnswers = [];
let userName = "";
let correctCount = 0;
let inputElement = document.querySelector(".user-name");

function getUserName() {
  userName = inputElement.value;
  console.log("The user name is:", userName);
}

const showstart = document.getElementById("start-button");
showstart.classList.add("show-start");

const countdownDisplay = document.getElementById("countdown-display");
const startButton = document.getElementById("start-button");
const leaderboardButton = document.getElementById("leaderboard-button");
const pauseBtn = document.getElementById("pauseBtn");
const resumeBtn = document.getElementById("resumeBtn");
const overlay = document.getElementById("pause-overlay");
const pauseWarning = document.getElementById("pause-warning");
const timeoutElement = document.querySelector(".timeout");

const TOTAL_TIME_SECONDS = 600;
let countdownTime = TOTAL_TIME_SECONDS;
let countdownInterval;
const QUESTION_LIMIT = 3;
let isPaused = false; // FIX: detta styr nu också canvas-regnet
let rigthToPause = false;
let pendingPause = false;
let resumeResolve;

const sounds = {
  correct: new Audio("./media/sounds/correct.mp3"),
  wrong: new Audio("./media/sounds/incorrect.mp3"),
  shame: new Audio("./media/sounds/aww-man.mp3"),
  applause: new Audio("./media/sounds/applause.mp3"),
  champion: new Audio("./media/sounds/champion.mp3")
};

function playSound(key) {
  if (!sounds[key]) return;
  sounds[key].currentTime = 0;
  sounds[key].play().catch(() => {});
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}


function updateCountdown() {
  // Stoppa nedräkningen när spelet är pausat
  if (isPaused) return;

  countdownTime--;
  countdownDisplay.textContent = formatTime(countdownTime);

  if (countdownTime <= 0) {
    clearInterval(countdownInterval);
    startButton.style.display = "flex";
    startButton.textContent = "Börja om";
    countdownTime = TOTAL_TIME_SECONDS;
    timeoutElement.style.display = "flex";
    document.getElementById("question-container").classList.add("hidden");
  }
}


function startCountdown() {
  clearInterval(countdownInterval);
  countdownTime = TOTAL_TIME_SECONDS;
  startButton.style.display = "none";
  countdownDisplay.textContent = formatTime(countdownTime);
  countdownInterval = setInterval(updateCountdown, 1000);
  timeoutElement.style.display = "none";
  inputElement.style.display = "none";
  const h1div = document.getElementById("h1"); // hide tittle
  h1div.style.display = "none"; // hide tittle
}

inputElement.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); 
        document.getElementById('start-button').click();
    }
});

function resultatRestartGame() {
  document.getElementById("result-container").classList.add("hidden");
  startCountdown();
  init();
}

startButton.addEventListener("click", startCountdown);
startButton.addEventListener("click", startshow);
startButton.addEventListener("click", resultatRestartGame);

async function getQuizQuestions() {
  try {
    const response = await fetch("questions.json");

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    const shuffledData = shuffle(data);
    return shuffledData.slice(0, QUESTION_LIMIT);
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

function waitForAnswer(answerElements) {
  return new Promise((resolve) => {
    answerElements.forEach((btn, index) => {
      const handleClick = () => {
        rigthToPause = true;
        pauseWarning.classList.add("hidden");
        answerElements.forEach((b) => b.removeEventListener("click", handleClick));
        resolve(index);
      };
      btn.addEventListener("click", handleClick);
    });
  });
}

pauseBtn.addEventListener("click", () => {
  if (!rigthToPause) {
    pauseWarning.classList.remove("hidden");
    pendingPause = true;
    return;
  }

  isPaused = !isPaused;

  if (isPaused) showPausePopup();
  else {
    hidePausePopup();
    resume();
  }
});

resumeBtn.addEventListener("click", () => {
  isPaused = false;
  hidePausePopup();
  resume();
});

function waitForUnpause() {
  if (!isPaused) return Promise.resolve();

  return new Promise(r => {
    resumeResolve = r;
  });
}

function resume() {
  if (resumeResolve) {
    resumeResolve();
    resumeResolve = null;
  }
}

function showPausePopup() {
  overlay.classList.remove("hidden");
  requestAnimationFrame(() => overlay.classList.add("show"));
}

function hidePausePopup() {
  overlay.classList.remove("show");
  setTimeout(() => overlay.classList.add("hidden"), 350);
}

async function renderHTML() {
  pauseBtn.classList.remove("hidden");
  userAnswers = [];

  const answerElements = [
    document.getElementById("answer-one"),
    document.getElementById("answer-two"),
    document.getElementById("answer-three"),
    document.getElementById("answer-four")
  ];

  const questionElement = document.getElementById("question");

  for (const q of questions) {
    questionElement.textContent = q.question;

    q.answers.forEach((answer, i) => {
      answerElements[i].textContent = answer;
      answerElements[i].classList.add("answers");
    });

    const chosenIndex = await waitForAnswer(answerElements);
    userAnswers.push(chosenIndex);

    const chosenElement = answerElements[chosenIndex];
    const correctIndex = q.correct;
    const correctElement = answerElements[correctIndex];

    answerElements.forEach(el => el.classList.remove("answers"));

    if (chosenIndex === correctIndex) {
      playSound("correct");
      chosenElement.classList.add("correct");
      correctCount++;
    } else {
      playSound("wrong");
      chosenElement.classList.add("wrong");
      correctElement.classList.add("correct");
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
    if (pendingPause) {
      pendingPause = false;
      isPaused = true;
      showPausePopup();
    }
    await waitForUnpause();

    rigthToPause = false;

    chosenElement.classList.remove("correct", "wrong");
    correctElement.classList.remove("correct");
    void chosenElement.offsetWidth;
    void correctElement.offsetWidth;
  }

  endQuiz();
}

async function endQuiz(timeOut = false) {
  clearInterval(countdownInterval);

  const resultContainer = document.getElementById("result-container");
  const questionContainer = document.getElementById("question-container");
  questionContainer.classList.add("hidden");
  resultContainer.classList.remove("hidden");
  leaderboardButton.classList.remove("hidden");
  document.getElementById("restart-button").classList.remove("hidden");

  const timeUsed = `${Math.floor((TOTAL_TIME_SECONDS - countdownTime) / 60)} min ${(TOTAL_TIME_SECONDS - countdownTime) % 60} sek`;
  const timeRemaining = countdownTime;

  const percent = correctCount / questions.length * 100;

  if (percent < 60) {
    playSound("shame");
    spawnFX("bad");
  } else if (percent < 80) {
    playSound("applause");
    spawnFX("mid");
  } else {
    playSound("champion");
    spawnFX("good");
  }

  document.getElementById("score").innerHTML = `
    <strong>Du fick ${correctCount} av ${questions.length} rätt!</strong><br>
    ${timeOut ? "⏰ Tiden tog slut!" : ""}
    <br><br>
    <strong>Tid använd:</strong> ${timeUsed}<br>
    <strong>Tid kvar:</strong> ${Math.floor(timeRemaining / 60)} min ${timeRemaining % 60} sek
  `;

  await saveResultToLocal(correctCount, questions, timeUsed, timeRemaining, userName);
}

function startshow() {
  const startshow = document.getElementById("question-container");
  startshow.classList.remove("hidden");
  getUserName();

  const leaderboard = document.getElementById("leaderboard-container");
  if (!leaderboard.classList.contains("hidden")) leaderboard.classList.add("hidden");

  leaderboardButton.classList.add("hidden");
  renderHTML();

  document.querySelector(".userDiv").textContent = userName; //skapar div user
}

async function init() {
  correctCount = 0;
  const fetchedQuestions = await getQuizQuestions();
  if (fetchedQuestions.length > 0) questions = fetchedQuestions;
  else console.error("Inga frågor kunde hämtas.");
}

function restartQuiz() {
  document.getElementById("result-container").classList.add("hidden");
  document.getElementById("score").innerHTML = "";

  const restartBtn = document.getElementById("restart-button");
  restartBtn.classList.add("hidden");

  leaderboardButton.classList.remove("hidden");
  startButton.style.display = "flex";

  init();
}

document.getElementById("restart-button").addEventListener("click", restartQuiz);

async function showLeaderboard() {
  const container = document.getElementById("leaderboard-container");
  const list = document.getElementById("leaderboard-list");
  list.innerHTML = "";

  const results = await loadResults();

  if (!results || results.length === 0) {
    list.innerHTML = `<li>Inga resultat hittades ännu.</li>`;
    container.classList.remove("hidden");
    return;
  }

  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.timeRemaining - a.timeRemaining;
  });

  const topTen = results.slice(0, 10);

  topTen.forEach((r, i) => {
    const li = document.createElement("li");

    if (i === 0) li.classList.add("firstRanked");
    else if (i === 1) li.classList.add("secondRanked");
    else if (i === 2) li.classList.add("thirdRanked");
    else li.classList.add("ranked");

    let rankDisplay;
    if (i === 0) rankDisplay = "#1";
    else if (i === 1) rankDisplay = "#2";
    else if (i === 2) rankDisplay = "#3";
    else rankDisplay = `#${i + 1}`;

    li.innerHTML = `
      <span class="rank">${rankDisplay}</span>
      <span class="user">${r.userName || "Anonym"}</span>
      <span class="score">${r.score}/${r.total} – ${r.timeUsed}</span>
    `;

    list.appendChild(li);
  });

  container.classList.remove("hidden");
  document.getElementById("question-container").classList.add("hidden");
  document.getElementById("result-container").classList.add("hidden");
}

document.getElementById("close-leaderboard").addEventListener("click", () => {
  document.getElementById("leaderboard-container").classList.add("hidden");
});

function spawnFX(type) {
  const fxContainer = document.getElementById("fx-container");
  fxContainer.innerHTML = ""; // rensa

  const emojisGood = ["✨", "🎉", "💥", "⭐", "🔥", "💫"];
  const emojisMid  = ["⭐", "👍", "💫"];
  const emojisBad  = ["💀", "☠️", "💣", "🩸"];

  let list = type === "good" ? emojisGood :
             type === "mid"  ? emojisMid  :
                               emojisBad;

  const amount = 18; // fler element

  for (let i = 0; i < amount; i++) {
    const el = document.createElement("div");
    el.classList.add("fx");

    // animationstyp
    if (type === "bad") el.classList.add("fx-fall");
    else el.classList.add("fx-burst");

    el.textContent = list[Math.floor(Math.random() * list.length)];

    // 🔥 bredare spridning
    const spread = 350;

    // burst → sprid åt alla håll
    if (type !== "bad") {
      el.style.setProperty("--dx", (Math.random() * spread - spread/2) + "px");
      el.style.setProperty("--dy", (Math.random() * spread - spread/2) + "px");
    }

    // bad → faller rakt NED men sprids brett horisontellt
    else {
      el.style.setProperty("--dx", (Math.random() * spread - spread/2) + "px");
    }

    // ⏱ slumpad längd 2–5 sek
    const duration = 2 + Math.random() * 3;
    el.style.animationDuration = duration + "s";

    // slumpad liten delay
    el.style.animationDelay = (Math.random() * 0.5) + "s";

    fxContainer.appendChild(el);
  }
}


document.getElementById("leaderboard-button").addEventListener("click", showLeaderboard);

init();

//MATRIX RAIN
let rainPaused = false;
var c = document.getElementById("c");
var ctx = c.getContext("2d");

c.height = window.innerHeight;
c.width = window.innerWidth;

var matrix = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}`";
matrix = matrix.split("");

var font_size = 10;
var columns = c.width / font_size;
var drops = [];

for (var x = 0; x < columns; x++) drops[x] = 1;

function draw() {
 if (isPaused || rainPaused) return; // ← istället för paused

  ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.fillStyle = "#cd7f32";
  ctx.font = font_size + "px arial";

  for (var i = 0; i < drops.length; i++) {
    var text = matrix[Math.floor(Math.random() * matrix.length)];
    ctx.fillText(text, i * font_size, drops[i] * font_size);

    if (drops[i] * font_size > c.height && Math.random() > 0.975)
      drops[i] = 0;

    drops[i]++;
  }
}

setInterval(draw, 35);


// styr endast matrix-regnet
document.querySelector(".theme-btn").addEventListener("click", function () {
    rainPaused = !rainPaused;
    this.textContent = rainPaused ? "<theme>" : "<no-theme>";
});