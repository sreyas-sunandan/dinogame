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
// Difficulty settings
let minSpawnTime = 500;   // Minimum delay in ms
let maxSpawnTime = 3000;  // Starting maximum delay
let burstMode = false;    // When true → spawn faster
let burstChance = 0.2;    // 20% chance to trigger burst mode after each cactus

function createCactus() {
  const now = Date.now();
  if (now - lastSpawnTime < 800) {
    cactusSpawnTimer = setTimeout(createCactus, 200);
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

      if (score % 5 === 0) {
        speed += 0.5; // Increase cactus movement speed
        maxSpawnTime = Math.max(1000, maxSpawnTime - 200); // Reduce spawn delay
      }
    }

    if (isCollision(dino, cactus)) {
      clearInterval(moveInterval);
      gameOver();
    }
  }, 20);

  // Decide if we toggle burst mode
  if (Math.random() < burstChance) {
    burstMode = !burstMode; // Toggle between fast and normal
  }

  // If burst mode is active → spawn faster
  let adjustedMin = burstMode ? minSpawnTime : minSpawnTime + 500;
  let adjustedMax = burstMode ? maxSpawnTime - 500 : maxSpawnTime;

  const nextCactusTime = Math.random() * (adjustedMax - adjustedMin) + adjustedMin;
  cactusSpawnTimer = setTimeout(createCactus, nextCactusTime);
}




// Collision detection using Dino's clip-path shape
function isCollision(dinoElem, cactusElem) {
  const gameRect = document.getElementById("game").getBoundingClientRect();
  const dinoRect = dinoElem.getBoundingClientRect();
  const cactusRect = cactusElem.getBoundingClientRect();

  // Convert to game-area coordinates
  const dinoX = dinoRect.left - gameRect.left;
  const dinoY = dinoRect.top - gameRect.top;
  const cactusX = cactusRect.left - gameRect.left;
  const cactusY = cactusRect.top - gameRect.top;

  // Dino's polygon based on your CSS clip-path
  const dinoPoints = [
    [dinoX + dinoRect.width * 0.5, dinoY + dinoRect.height],     // bottom center
    [dinoX,                      dinoY + dinoRect.height * 0.2], // left mid
    [dinoX + dinoRect.width,     dinoY],                         // top right
    [dinoX + dinoRect.width * 0.75, dinoY + dinoRect.height]     // bottom right
  ];

  // Cactus rectangle as polygon
  const cactusPoints = [
    [cactusX, cactusY],
    [cactusX + cactusRect.width, cactusY],
    [cactusX + cactusRect.width, cactusY + cactusRect.height],
    [cactusX, cactusY + cactusRect.height]
  ];

  // Helper: Check polygon intersection
  function polygonsIntersect(a, b) {
    function doPolygonsIntersect(p1, p2) {
      const polygons = [p1, p2];
      for (let i = 0; i < polygons.length; i++) {
        const polygon = polygons[i];
        for (let i1 = 0; i1 < polygon.length; i1++) {
          const i2 = (i1 + 1) % polygon.length;
          const p1x = polygon[i1][0], p1y = polygon[i1][1];
          const p2x = polygon[i2][0], p2y = polygon[i2][1];

          const normal = { x: p1y - p2y, y: p2x - p1x };

          let minA = null, maxA = null;
          for (const p of p1) {
            const projected = normal.x * p[0] + normal.y * p[1];
            if (minA === null || projected < minA) minA = projected;
            if (maxA === null || projected > maxA) maxA = projected;
          }

          let minB = null, maxB = null;
          for (const p of p2) {
            const projected = normal.x * p[0] + normal.y * p[1];
            if (minB === null || projected < minB) minB = projected;
            if (maxB === null || projected > maxB) maxB = projected;
          }

          if (maxA < minB || maxB < minA) return false;
        }
      }
      return true;
    }
    return doPolygonsIntersect(a, b);
  }

  return polygonsIntersect(dinoPoints, cactusPoints);
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

