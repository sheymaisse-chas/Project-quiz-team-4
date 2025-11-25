const sounds = {
  correct: new Audio("./media/sounds/correct.mp3"),
  wrong: new Audio("./media/sounds/incorrect.mp3"),
  shame: new Audio("./media/sounds/aww-man.mp3"),
  applause: new Audio("./media/sounds/applause.mp3"),
  champion: new Audio("./media/sounds/champion.mp3")
};

export function playSound(key) {
  if (!sounds[key]) return;
  sounds[key].currentTime = 0;
  sounds[key].play().catch(() => {});
}

export function spawnFX(type) {
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