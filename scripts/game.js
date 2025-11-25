import { startCountdown, state, countdownInterval, TOTAL_TIME_SECONDS, countdownTime } from "./timer.js";
import { saveResultToLocal } from "../quizStorage.js";
import { playSound, spawnFX } from "./effects.js";
import { overlay, pauseBtn, resumeBtn, leaderboardButton, startButton, pauseWarning } from "./dom.js";
import { getQuizQuestions } from "./questions.js ";

export let questions = [];
export let userAnswers = [];
export let userName = "";
export let correctCount = 0;

export function setUserName(value) {
  userName = value;
}

export let rigthToPause = false;
let resumeResolve;
export const statePendingPause = {
   pendingPause: false
};

export function togglePendingPause() {
  statePendingPause.pendingPause = !statePendingPause.pendingPause;
};

export async function init() {
  correctCount = 0;
  const fetchedQuestions = await getQuizQuestions();
  if (fetchedQuestions.length > 0) questions = fetchedQuestions;
  else console.error("Inga frågor kunde hämtas.");
}

// Väntar på att användaren klickar på ett svar
export function waitForAnswer(answerElements) {
  return new Promise((resolve) => {
    answerElements.forEach((btn, index) => {
      const handleClick = () => {
        rigthToPause = true;
        // DOM-manipulation måste skickas in eller hanteras i main.js/UI
        answerElements.forEach((b) => b.removeEventListener("click", handleClick));
        resolve(index);
      };
      btn.addEventListener("click", handleClick);
    });
  });
}

// Väntar på att spelet ska återupptas efter paus
export function waitForUnpause() {
  if (!state.isPaused) return Promise.resolve();

  return new Promise(r => {
    resumeResolve = r;
  });
}

// Återupptar spelet efter paus
export function resume() {
  if (resumeResolve) {
    if (!pauseWarning.classList.contains("hidden")) pauseWarning.classList.add("hidden");
    pauseWarning.classList.add("hidden");
    resumeResolve();
    resumeResolve = null;
  }
}

// Visar paus-popup (UI-effekt)
export function showPausePopup() {
  overlay.classList.remove("hidden");
  requestAnimationFrame(() => overlay.classList.add("show"));
}

// Dölj paus-popup
export function hidePausePopup() {
  overlay.classList.remove("show");
  setTimeout(() => overlay.classList.add("hidden"), 350);
}

// Huvudloop för quizet
export async function renderHTML() {
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
    if (statePendingPause.pendingPause) {
      togglePendingPause();
      state.isPaused = true;
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

// Hanterar slutresultat
export async function endQuiz(timeOut = false) {
  clearInterval(countdownInterval);

  const resultContainer = document.getElementById("result-container");
  const questionContainer = document.getElementById("question-container");
  questionContainer.classList.add("hidden");
  resultContainer.classList.remove("hidden");
  leaderboardButton.classList.remove("hidden");
  pauseBtn.classList.add("hidden");
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

export function restartQuiz() {
  console.log("restart");
  document.getElementById("result-container").classList.add("hidden");
  document.getElementById("leaderboard-container").classList.add("hidden");
//   pauseWarning.classList.add("hidden");
  document.getElementById("score").innerHTML = "";

  const restartBtn = document.getElementById("restart-button");
  restartBtn.classList.add("hidden");

  leaderboardButton.classList.remove("hidden");
  startButton.style.display = "flex";
  console.log("restart-end");

  init();
}

// // Starta om spel + render HTML
// export function resultatRestartGame() {
//   console.log();
//   document.getElementById("result-container").classList.add("hidden");
//   startCountdown();
//   init();
// }

