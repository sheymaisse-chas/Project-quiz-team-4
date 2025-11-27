import { loadResults } from "../quizStorage.js";

export async function showLeaderboard() {
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

  const topTen = results.slice(0, 30);

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