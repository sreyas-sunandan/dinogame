const dino = document.getElementById('dino');
const scoreDisplay = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const finalScore = document.getElementById('final-score');
const gameArea = document.getElementById('game');

let isJumping = false;
let gravity = 0.7;
let velocity = 0;
let position = 0;
let score = 0;
let gameRunning = true;
let cactusSpawnTimer;

function jump() {
  if (!isJumping && gameRunning) {
    velocity = 14;
    isJumping = true;
  }
}

function updateDino() {
  velocity -= gravity;
  position += velocity;

  if (position <= 0) {
    position = 0;
    isJumping = false;
  }

  dino.style.bottom = position + 'px';
}

function createCactus() {
  const cactus = document.createElement('div');
  cactus.classList.add('cactus');
  cactus.style.left = '800px';
  gameArea.appendChild(cactus);

  let cactusLeft = 800;
  const moveInterval = setInterval(() => {
    if (!gameRunning) {
      clearInterval(moveInterval);
      cactus.remove();
      return;
    }

    cactusLeft -= 6;
    cactus.style.left = cactusLeft + 'px';

    if (cactusLeft < -30) {
      clearInterval(moveInterval);
      cactus.remove();
      score++;
      scoreDisplay.innerText = `Score: ${score}`;
    }

    if (isCollision(dino, cactus)) {
      clearInterval(moveInterval);
      gameOver();
    }
  }, 20);

  // Spawn next cactus randomly
  const nextCactusTime = Math.random() * 2000 + 1000; // 1000ms to 3000ms
  cactusSpawnTimer = setTimeout(createCactus, nextCactusTime);
}

function isCollision(dinoElem, cactusElem) {
  const dinoRect = dinoElem.getBoundingClientRect();
  const cactusRect = cactusElem.getBoundingClientRect();

  return (
    dinoRect.right > cactusRect.left &&
    dinoRect.left < cactusRect.right &&
    dinoRect.bottom > cactusRect.top
  );
}

function gameOver() {
  gameRunning = false;
  clearTimeout(cactusSpawnTimer);
  gameOverScreen.style.display = 'flex';
  finalScore.innerText = `Game Over! Your Score: ${score}`;
}

function restartGame() {
  position = 0;
  velocity = 0;
  score = 0;
  isJumping = false;
  gameRunning = true;
  gameOverScreen.style.display = 'none';
  scoreDisplay.innerText = `Score: 0`;

  // Remove existing cacti
  document.querySelectorAll('.cactus').forEach(c => c.remove());

  loop();
  createCactus(); // Restart cactus spawning
}

function loop() {
  if (gameRunning) {
    updateDino();
    requestAnimationFrame(loop);
  }
}

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') jump();
});

document.addEventListener('touchstart', () => {
  jump();
});

loop();
createCactus(); // Start spawning cactus

