const dino = document.getElementById('dino');
const cactus = document.getElementById('cactus');
const scoreDisplay = document.getElementById('score');

let isJumping = false;
let gravity = 0.9;
let position = 0;
let score = 0;

function jump() {
  if (isJumping) return;
  isJumping = true;

  let upInterval = setInterval(() => {
    if (position >= 150) {
      clearInterval(upInterval);
      let downInterval = setInterval(() => {
        if (position <= 0) {
          clearInterval(downInterval);
          isJumping = false;
        } else {
          position -= 5;
          dino.style.bottom = position + 'px';
        }
      }, 20);
    } else {
      position += 5;
      dino.style.bottom = position + 'px';
    }
  }, 20);
}

function startGame() {
  let cactusPosition = 1000;

  const gameLoop = setInterval(() => {
    if (cactusPosition < -50) {
      cactusPosition = 1000;
      score++;
      scoreDisplay.innerText = `Score: ${score}`;
    } else {
      cactusPosition -= 10;
    }

    cactus.style.left = cactusPosition + 'px';

    // collision detection
    if (
      cactusPosition > 50 && cactusPosition < 90 &&
      position < 50
    ) {
      clearInterval(gameLoop);
      alert('Game Over! Your score: ' + score);
      window.location.reload();
    }
  }, 30);
}

document.addEventListener('keydown', function (e) {
  if (e.code === 'Space') {
    jump();
  }
});

startGame();

