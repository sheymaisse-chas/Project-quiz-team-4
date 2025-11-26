import { state } from "./timer.js";

let rainPaused = false;

let c = document.getElementById("c");
let ctx = c.getContext("2d");

let matrix = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ123456789@#$%^&*()*&^%+-/~{[|`]}`".split("");

let font_size = 10;
let columns;
let drops = [];

// gör en funktion som kan köras även vid resize
// function resizeCanvas() {
//   c.height = window.innerHeight;
//   c.width = window.innerWidth;

//   columns = Math.floor(c.width / font_size);
//   drops = [];

//   for (let x = 0; x < columns; x++) drops[x] = 1;
// }

export function resizeCanvas() {
  c.width = window.innerWidth;
  c.height = window.innerHeight;

  columns = Math.floor(c.width / font_size);
  drops = new Array(columns).fill(1);
}

// kör direkt vid start
resizeCanvas();

// kör när fönstret ändras
window.addEventListener("resize", resizeCanvas);

export function draw() {
  if (state.isPaused || rainPaused) return;

  ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
  ctx.fillRect(0, 0, c.width, c.height);

  ctx.fillStyle = "#cd7f32";
  ctx.font = font_size + "px arial";

  for (let i = 0; i < drops.length; i++) {
    let text = matrix[Math.floor(Math.random() * matrix.length)];
    ctx.fillText(text, i * font_size, drops[i] * font_size);

    if (drops[i] * font_size > c.height && Math.random() > 0.975) {
      drops[i] = 0;
    }

    drops[i]++;
  }
}

// knapp
document.querySelector(".theme-btn").addEventListener("click", function () {
  rainPaused = !rainPaused;
  this.textContent = rainPaused ? "<theme>" : "<no-theme>";
});
