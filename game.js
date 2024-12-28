// Отримуємо елемент canvas та контекст для малювання
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Отримуємо елементи для відображення інформації про гру
const scoreDisplay = document.getElementById('score');
const livesDisplay = document.getElementById('lives');
const highScoreDisplay = document.getElementById('high-score');
const recordTableBody = document.getElementById('record-table-body');
const pauseButton = document.getElementById('pause-button'); // Кнопка паузи

// Змінні для керування платформою
const platformWidth = 80;
const platformHeight = 20;
let platformSpeed = 10; // Швидкість руху платформи
let platformX = (canvas.width - platformWidth) / 2; // Платформа по центру

// Об'єкт для платформи
const platform = { x: platformX, y: canvas.height - platformHeight - 10, color: 'white' };

// Змінні для крапель
let droplets = [];
const dropletSize = 20;
const dropletSpeed = 1.7; // Швидкість падіння крапель
const dropletColors = ['red', 'blue', 'yellow', 'gold', 'black', 'rainbow'];
const spawnRate = 1200; // Частота появи крапель є сталою
let lastSpawnTime = 0;

// Змінні для гри
let score = 0;
let lives = 3;
let highScore = 0;
let isPaused = false; // Статус паузи

// Функція для малювання платформи
function drawPlatform() {
    ctx.fillStyle = platform.color;
    ctx.fillRect(platform.x, platform.y, platformWidth, platformHeight);
}

// Функція для створення нової краплі
function createDroplet() {
    const x = Math.random() * (canvas.width - dropletSize);
    const y = -dropletSize;
    const color = dropletColors[Math.floor(Math.random() * dropletColors.length)];
    droplets.push({ x, y, color });
}

// Функція для малювання крапель
function drawDroplets() {
    droplets.forEach(droplet => {
        ctx.fillStyle = droplet.color;
        if (droplet.color === 'rainbow') {
            const gradient = ctx.createRadialGradient(
                droplet.x + dropletSize / 2,
                droplet.y + dropletSize / 2,
                0,
                droplet.x + dropletSize / 2,
                droplet.y + dropletSize / 2,
                dropletSize / 2
            );
            gradient.addColorStop(0, 'red');
            gradient.addColorStop(1, 'violet');
            ctx.fillStyle = gradient;
        }
        ctx.beginPath();
        ctx.arc(droplet.x + dropletSize / 2, droplet.y + dropletSize / 2, dropletSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
    });
}

// Обробник подій для клавіш
function handleKeyDown(e) {
    if (isPaused) return;

    switch (e.key) {
        case 'ArrowLeft':
            platform.x = Math.max(platform.x - platformSpeed, 0);
            break;
        case 'ArrowRight':
            platform.x = Math.min(platform.x + platformSpeed, canvas.width - platformWidth);
            break;
    }
}

// Оновлення позицій крапель
function updateDroplets() {
    droplets.forEach(droplet => {
        droplet.y += dropletSpeed;
    });

    droplets = droplets.filter(droplet => droplet.y < canvas.height);
}

// Перевірка попадань крапель у платформу
function checkDropletCollision() {
    const updatedDroplets = [];

    droplets.forEach(droplet => {
        if (
            droplet.y + dropletSize >= platform.y &&
            droplet.x < platform.x + platformWidth &&
            droplet.x + dropletSize > platform.x
        ) {
            switch (droplet.color) {
                case 'red':
                case 'blue':
                case 'yellow':
                    score += 1;
                    break;
                case 'gold':
                    score += 5;
                    break;
                case 'rainbow':
                    lives += 1;
                    break;
                case 'black':
                    lives -= 1;
                    break;
            }
            scoreDisplay.textContent = score;
            livesDisplay.textContent = lives;
            if (lives <= 0) {
                endGame();
            }
        } else if (droplet.y + dropletSize >= canvas.height) {
            if (droplet.color !== 'black') { // Чорні краплі не зменшують рахунок
                lives--;
                livesDisplay.textContent = lives;
                if (lives <= 0) {
                    endGame();
                }
            }
        } else {
            updatedDroplets.push(droplet);
        }
    });

    droplets = updatedDroplets;
}

// Оновлення гри
function updateGame() {
    if (isPaused) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlatform();
    drawDroplets();
    updateDroplets();
    checkDropletCollision();
}

// Встановлення інтервалу для створення крапель
function spawnDroplets(timestamp) {
    if (isPaused) return;

    if (timestamp - lastSpawnTime > spawnRate) {
        createDroplet();
        lastSpawnTime = timestamp;
    }
}

// Основний цикл гри
function gameLoop(timestamp) {
    updateGame();
    spawnDroplets(timestamp);
    requestAnimationFrame(gameLoop);
}

// Скид гри
function resetGame() {
    score = 0;
    lives = 3;
    droplets = [];
    platform.x = (canvas.width - platformWidth) / 2;
    scoreDisplay.textContent = score;
    livesDisplay.textContent = lives;
    loadHighScore();
}

// Завершення гри
function endGame() {
    alert(`Гра завершена! Ваш рахунок: ${score}`);
    updateHighScore();
    resetGame();
}

// Оновлення найвищого рахунку
function updateHighScore() {
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }
    highScoreDisplay.textContent = highScore;
}

// Завантаження найвищого рахунку
function loadHighScore() {
    highScore = parseInt(localStorage.getItem('highScore')) || 0;
    highScoreDisplay.textContent = highScore;
}

// Функція для паузи
function togglePause() {
    isPaused = !isPaused;
    pauseButton.textContent = isPaused ? 'Продовжити' : 'Пауза';
}

// Запуск гри
resetGame();
requestAnimationFrame(gameLoop);

document.addEventListener('keydown', handleKeyDown);
pauseButton.addEventListener('click', togglePause);
