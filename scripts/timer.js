import { countdownDisplay, startButton, timeoutElement, inputElement } from "./dom.js";

export const TOTAL_TIME_SECONDS = 600;
export let countdownTime = TOTAL_TIME_SECONDS;
export let countdownInterval;
// export let isPaused = false; // FIX: detta styr nu också canvas-regnet
export let state = {
    isPaused: false // FIX: detta styr nu också canvas-regnet
};

export function togglePause() {
  state.isPaused = !state.isPaused;
}

export function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}


export function updateCountdown() {
  // Stoppa nedräkningen när spelet är pausat
  if (state.isPaused) return;

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


export function startCountdown() {
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