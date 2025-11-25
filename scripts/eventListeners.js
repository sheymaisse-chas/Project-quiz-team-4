// import { startButton, pauseBtn, resumeBtn, overlay, pauseWarning } from "./dom.js";
// import { startCountdown, togglePause, state } from "./timer.js";
// import { showLeaderboard } from "./leaderBoard.js";

// let pendingPauseState = {
//     pendingPause:false
// };
// export function pendingPauseToggle() {
//     pendingPauseState.pendingPause = !pendingPauseState.pendingPause;
// }

// export function setupEventListeners() {
//     startButton.addEventListener("click", startCountdown);
//     startButton.addEventListener("click", startshow);
//     startButton.addEventListener("click", resultatRestartGame);
    
//     document.getElementById("restart-button").addEventListener("click", restartQuiz);
    
//     document.getElementById("leaderboard-button").addEventListener("click", showLeaderboard);
    
//     document.getElementById("close-leaderboard").addEventListener("click", () => {
//       document.getElementById("leaderboard-container").classList.add("hidden");
//     });
    
//     pauseBtn.addEventListener("click", () => {
//       if (!rigthToPause) {
//         pauseWarning.classList.remove("hidden");
//         pendingPauseState.pendingPause = true;
//         return;
//       }
    
//       togglePause();
    
//       if (state.isPaused) showPausePopup();
//       else {
//         hidePausePopup();
//         resume();
//       }
//     });
    
    
//     resumeBtn.addEventListener("click", () => {
//       state.isPaused = false;
//       hidePausePopup();
//       resume();
//     });
// }