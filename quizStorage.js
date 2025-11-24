import firebaseConfig from "./firebaseConfig.json" with { type: "json" };
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-app.js";
import { getFirestore, doc, addDoc, getDocs, collection } from "https://www.gstatic.com/firebasejs/9.4.0/firebase-firestore.js";


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// === Spara resultat lokalt + i Firebase ===
export async function saveResultToLocal(correctCount, questions, timeUsed, timeRemaining, userName) {
  const previousResults = JSON.parse(localStorage.getItem("quizResults")) || [];

  const newResult = {
    date: new Date().toLocaleString(),
    score: correctCount,
    total: questions.length,
    timeUsed,
    timeRemaining,
    userName: userName || "Anonym",
  };

  previousResults.push(newResult);
  localStorage.setItem("quizResults", JSON.stringify(previousResults));

  try {
    await addDoc(collection(db, "quizResults"), newResult);
    console.log("✅ Sparat till Firebase");
  } catch (err) {
    console.error("❌ Fel vid Firebase-sparning:", err);
  }
}

// === Hämta & slå ihop data (Firebase + localStorage) ===
export async function loadResults() {
  const localResults = JSON.parse(localStorage.getItem("quizResults")) || [];

  const snapshot = await getDocs(collection(db, "quizResults"));
  const firebaseResults = snapshot.docs.map((doc) => doc.data());

  const combined = [...localResults, ...firebaseResults];
  const uniqueResults = combined.filter(
    (v, i, a) =>
      a.findIndex(
        (t) => t.date === v.date && t.score === v.score && t.timeRemaining === v.timeRemaining
      ) === i
  );

  const sorted = uniqueResults.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return parseInt(b.timeRemaining) - parseInt(a.timeRemaining);
  });
  console.log("Loaded results:", sorted);
  localStorage.setItem("quizResults", JSON.stringify(sorted));
  return sorted;
}

// === Visa resultat i DOM ===
// === !!!! Ersatt av leaderboard !!!! ===
export async function showResults(containerId = "resultsContainer") {
  const results = await loadResults();
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  results.forEach((r) => {
    const item = document.createElement("div");
    item.textContent = `${r.date} — Score: ${r.score}/${r.total} — Tid kvar: ${r.timeRemaining}`;
    container.appendChild(item);
  });
}
