const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const SCREEN_WIDTH = 400;
const SCREEN_HEIGHT = 600;
const LANE_WIDTH = SCREEN_WIDTH / 2;
const LANE_LEFT = LANE_WIDTH / 2;
const LANE_RIGHT = LANE_WIDTH + LANE_WIDTH / 2;

let score = 0;
let gameOver = false;
let gameRunning = false;
let speed = 5;

// Load Images
const images = {
    player: new Image(),
    enemy1: new Image(),
    enemy2: new Image(),
    enemy3: new Image()
};

images.player.src = 'car_yellow.png';
images.enemy1.src = 'car_blue.png';
images.enemy2.src = 'car_green.png';
images.enemy3.src = 'car_red.png';

let imagesLoadedCount = 0;
const totalImages = 4;
let allImagesLoaded = false;

const onImageLoad = () => {
    imagesLoadedCount++;
    if (imagesLoadedCount === totalImages) {
        allImagesLoaded = true;
        console.log('All images loaded');
    }
};

Object.values(images).forEach(img => img.onload = onImageLoad);

// Player
const player = {
    x: LANE_LEFT,
    y: SCREEN_HEIGHT - 120, 
    width: 50, 
    height: 90, 
    lane: 0 // 0 = left, 1 = right
};

// Enemies
let enemies = [];
let enemySpawnTimer = 0;

// Input
document.addEventListener('keydown', (e) => {
    if (gameOver && e.code === 'Enter') {
        resetGame();
    } else if (!gameRunning) {
        if (e.code !== 'Space') {
             gameRunning = true;
             document.getElementById('start-screen').classList.add('hidden');
             requestAnimationFrame(gameLoop);
        }
    } else {
        if (e.code === 'ArrowLeft' || e.key === 'a') {
            player.lane = 0;
        } else if (e.code === 'ArrowRight' || e.key === 'd') {
            player.lane = 1;
        }
    }
});

canvas.addEventListener('touchstart', (e) => {
    if (gameOver) {
        resetGame();
        return;
    }
    if (!gameRunning) {
        gameRunning = true;
        document.getElementById('start-screen').classList.add('hidden');
        requestAnimationFrame(gameLoop);
        return;
    }
    const rect = canvas.getBoundingClientRect();
    const touchX = e.touches[0].clientX - rect.left;
    if (touchX < rect.width / 2) {
        player.lane = 0;
    } else {
        player.lane = 1;
    }
});

// Restart Button
document.getElementById('restart-btn').addEventListener('click', () => {
    if (gameOver) {
        resetGame();
    }
});

function resetGame() {
    score = 0;
    speed = 6;
    enemies = [];
    gameOver = false;
    gameRunning = true;
    document.getElementById('game-over').classList.add('hidden');
    document.getElementById('score').innerText = 'SCORE: 0';
    requestAnimationFrame(gameLoop);
}

function update() {
    // Move player
    const targetX = player.lane === 0 ? LANE_LEFT : LANE_RIGHT;
    player.x += (targetX - player.x) * 0.3;

    // Spawn enemies
    enemySpawnTimer++;
    if (enemySpawnTimer > 60) {
        const typeIdx = Math.floor(Math.random() * 3);
        enemies.push({
            x: Math.random() < 0.5 ? LANE_LEFT : LANE_RIGHT,
            y: -150, 
            width: 50,
            height: 90,
            type: typeIdx 
        });
        enemySpawnTimer = 0;
    }

    // Update enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
        enemies[i].y += speed;

        // Collision detection
        const hitBoxX = player.x - player.width / 2 + 5;
        const hitBoxY = player.y + 5;
        const hitBoxW = player.width - 10;
        const hitBoxH = player.height - 10;

        const enemyBoxX = enemies[i].x - enemies[i].width / 2 + 5;
        const enemyBoxY = enemies[i].y + 5;
        const enemyBoxW = enemies[i].width - 10;
        const enemyBoxH = enemies[i].height - 10;

        if (
            hitBoxX < enemyBoxX + enemyBoxW &&
            hitBoxX + hitBoxW > enemyBoxX &&
            hitBoxY < enemyBoxY + enemyBoxH &&
            hitBoxY + hitBoxH > enemyBoxY
        ) {
            gameOver = true;
            document.getElementById('game-over').classList.remove('hidden');
            document.getElementById('final-score').innerText = score;
        }

        // Score
        if (enemies[i].y > SCREEN_HEIGHT) {
            enemies.splice(i, 1);
            score++;
            document.getElementById('score').innerText = 'SCORE: ' + score;
            if (score % 5 === 0) speed += 0.5;
        }
    }
}

function draw() {
    // Background
    ctx.fillStyle = '#222';
    ctx.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);

    // Dynamic Road Grid
    ctx.fillStyle = '#444'; 
    ctx.fillRect(0, 0, 20, SCREEN_HEIGHT);
    ctx.fillRect(SCREEN_WIDTH - 20, 0, 20, SCREEN_HEIGHT);
    
    // Center line
    ctx.fillStyle = '#666'; 
    let offset = (Date.now() / 2 * speed) % 80;
    for (let i = -1; i < SCREEN_HEIGHT / 80 + 1; i++) {
         ctx.fillRect(SCREEN_WIDTH / 2 - 5, i * 80 + offset, 10, 40);
    }
    
    if (allImagesLoaded) {
        // Draw Player
        ctx.drawImage(images.player, 
            player.x - player.width / 2, player.y, player.width, player.height
        );
        
        // Draw Enemies
        for (let enemy of enemies) {
             let enemyImg;
             if (enemy.type === 0) enemyImg = images.enemy1;
             else if (enemy.type === 1) enemyImg = images.enemy2;
             else enemyImg = images.enemy3;

             ctx.drawImage(enemyImg, 
                enemy.x - enemy.width / 2, enemy.y, enemy.width, enemy.height
            );
        }
    } else {
        // Fallback Loading Text
        ctx.fillStyle = '#fff';
        ctx.font = '20px Arial';
        ctx.fillText('LOADING...', SCREEN_WIDTH/2 - 50, SCREEN_HEIGHT/2);
    }
}

function gameLoop() {
    if (!gameOver) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}
