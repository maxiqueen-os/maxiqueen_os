const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

let snake = [{x: 10, y: 10}];
let food = {x: 5, y: 5};
let dx = 0;
let dy = 0;
let score = 0;

document.addEventListener("keydown", changeDirection);

function changeDirection(e) {
  if (e.key === "ArrowUp") { dx = 0; dy = -1; }
  if (e.key === "ArrowDown") { dx = 0; dy = 1; }
  if (e.key === "ArrowLeft") { dx = -1; dy = 0; }
  if (e.key === "ArrowRight") { dx = 1; dy = 0; }
}

function gameLoop() {
  update();
  draw();
}

function update() {
  const head = {x: snake[0].x + dx, y: snake[0].y + dy};

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById("score").innerText = score;
    food = {
      x: Math.floor(Math.random()*15),
      y: Math.floor(Math.random()*15)
    };
  } else {
    snake.pop();
  }
}

function draw() {
  ctx.clearRect(0,0,300,300);

  snake.forEach(part => {
    ctx.fillStyle = "lime";
    ctx.fillRect(part.x*20, part.y*20, 18, 18);
  });

  ctx.fillStyle = "red";
  ctx.fillRect(food.x*20, food.y*20, 18, 18);
}

setInterval(gameLoop, 150);

function goBack() {
  window.location.href = "../../apps.html";
}