import { showstart, startButton, leaderboardButton, pauseBtn, resumeBtn, overlay, pauseWarning, timeoutElement, inputElement } from "./scripts/dom.js";
import { startCountdown, state, togglePause } from "./scripts/timer.js";
import { draw, resizeCanvas } from "./scripts/matrix.js";

import { showLeaderboard } from "./scripts/leaderBoard.js";
import { init, renderHTML, endQuiz, restartQuiz, setUserName, userName, rigthToPause, togglePendingPause, hidePausePopup, resume, showPausePopup} from "./scripts/game.js";



console.log("Script loaded successfully.");


showstart.classList.add("show-start");

function getUserName() {
  setUserName(inputElement.value);
  console.log("The user name is:", userName);
}

inputElement.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); 
        document.getElementById('start-button').click();
    }
});

startButton.addEventListener("click", startCountdown);
startButton.addEventListener("click", startshow);
// startButton.addEventListener("click", resultatRestartGame);

document.getElementById("restart-button").addEventListener("click", restartQuiz);

document.getElementById("leaderboard-button").addEventListener("click", showLeaderboard);

document.getElementById("close-leaderboard").addEventListener("click", () => {
  document.getElementById("leaderboard-container").classList.add("hidden");
});

pauseBtn.addEventListener("click", () => {
  if (!rigthToPause) {
    pauseWarning.classList.remove("hidden");
    togglePendingPause();
    return;
  }

  togglePause();

  if (state.isPaused) showPausePopup();
  else {
    pauseWarning.classList.add("hidden");
    hidePausePopup();
    resume();
  }
});


resumeBtn.addEventListener("click", () => {
  state.isPaused = false;
  hidePausePopup();
  resume();
});


function startshow() {
  console.log("Start button clicked");
  const startshow = document.getElementById("question-container");
  startshow.classList.remove("hidden");
  getUserName();

  const leaderboard = document.getElementById("leaderboard-container");
  if (!leaderboard.classList.contains("hidden")) leaderboard.classList.add("hidden");
  leaderboardButton.classList.add("hidden");
  renderHTML();

  document.querySelector(".userDiv").textContent = userName; //skapar div user
}

init();

setInterval(draw, 35);
// setInterval(draw, 35);

document.getElementById('newuser').addEventListener("click", () => {
  location.reload();
});



