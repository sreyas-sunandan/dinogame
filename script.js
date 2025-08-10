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
let speed = 6; // Starting cactus speed
let gameRunning = false;
let cactusSpawnTimer;
let lastSpawnTime = 0;

// Cactus images
const cactusImages = [
  'cactus1.png',
  'cactus3.png',
  'cactus2.png'
];

// Jump
function jump() {
  if (!isJumping && gameRunning) {
    velocity = 14;
    isJumping = true;
  }
}

// Dino update
function updateDino() {
  velocity -= gravity;
  position += velocity;

  if (position <= 0) {
    position = 0;
    isJumping = false;
  }

  dino.style.bottom = position + 'px';
}

// Create cactus (with random image)
function createCactus() {
  const now = Date.now();
  if (now - lastSpawnTime < 800) {
    cactusSpawnTimer = setTimeout(createCactus, 500);
    return;
  }
  lastSpawnTime = now;

  const cactus = document.createElement('img');
  cactus.classList.add('cactus');

  // Pick random cactus image
  cactus.src = cactusImages[Math.floor(Math.random() * cactusImages.length)];

  cactus.style.left = '800px';
  cactus.style.bottom = '0px';
  cactus.style.position = 'absolute';
  cactus.style.width = '40px';
  cactus.style.height = 'auto';

  gameArea.appendChild(cactus);

  let cactusLeft = 800;
  const moveInterval = setInterval(() => {
    if (!gameRunning) {
      clearInterval(moveInterval);
      cactus.remove();
      return;
    }

    cactusLeft -= speed;
    cactus.style.left = cactusLeft + 'px';

    if (cactusLeft < -60) {
      clearInterval(moveInterval);
      cactus.remove();
      score++;
      scoreDisplay.innerText = `Score: ${score}`;
      if (score % 5 === 0) speed += 0.5; // Increase difficulty
    }

    if (isCollision(dino, cactus)) {
      clearInterval(moveInterval);
      gameOver();
    }
  }, 20);

  const nextCactusTime = Math.random() * 2000 + 1000;
  cactusSpawnTimer = setTimeout(createCactus, nextCactusTime);
}

// Collision detection
function isCollision(dinoElem, cactusElem) {
  const dinoRect = dinoElem.getBoundingClientRect();
  const cactusRect = cactusElem.getBoundingClientRect();

  return (
    dinoRect.left < cactusRect.right &&
    dinoRect.right > cactusRect.left &&
    dinoRect.top < cactusRect.bottom &&
    dinoRect.bottom > cactusRect.top
  );
}

// Game over
function gameOver() {
  gameRunning = false;
  clearTimeout(cactusSpawnTimer);
  finalScore.innerText = `Game Over! Your Score: ${score}`;
  gameOverScreen.style.display = 'flex';
}

// Restart
function restartGame() {
  position = 0;
  velocity = 0;
  score = 0;
  speed = 6;
  isJumping = false;
  gameRunning = true;
  scoreDisplay.innerText = `Score: 0`;
  gameOverScreen.style.display = 'none';

  document.querySelectorAll('.cactus').forEach(c => c.remove());

  loop();
  createCactus();
}

// Main loop
function loop() {
  if (gameRunning) {
    updateDino();
    requestAnimationFrame(loop);
  }
}

// Controls
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    if (gameRunning) jump();
    else restartGame();
  }
});

document.addEventListener('touchstart', () => {
  if (gameRunning) jump();
  else restartGame();
});

// Start game
restartGame();

