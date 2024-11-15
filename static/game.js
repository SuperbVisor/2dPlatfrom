const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;

let player = { x: 50, y: 300, width: 50, height: 50, speed: 5, dx: 0, isJumping: false, dy: 0 };
let bullets = [];
let enemies = [];
let keys = {};
let gravity = 0.5;
let spawnInterval = 2000;
let lastSpawn = 0;

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;
    if (event.key === 'f') {
        bullets.push({ x: player.x + player.width, y: player.y + player.height / 2, width: 10, height: 5, speed: 7 });
    }
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;
});

function spawnEnemy() {
    const enemy = {
        x: canvas.width,
        y: 300,
        width: 50,
        height: 50,
        speed: 2
    };
    enemies.push(enemy);
}

function updatePlayer() {
    if (keys['ArrowRight']) player.dx = player.speed;
    else if (keys['ArrowLeft']) player.dx = -player.speed;
    else player.dx = 0;

    if (keys[' '] && !player.isJumping) {
        player.isJumping = true;
        player.dy = -10;
    }

    player.x += player.dx;

    if (player.isJumping) {
        player.dy += gravity;
        player.y += player.dy;
        if (player.y >= 300) {
            player.isJumping = false;
            player.y = 300;
            player.dy = 0;
        }
    }
}

function isColliding(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function updateBullets() {
    bullets.forEach((bullet, bulletIndex) => {
        bullet.x += bullet.speed;
        
        if (bullet.x > canvas.width) bullets.splice(bulletIndex, 1);

        // Periksa tabrakan dengan musuh
        enemies.forEach((enemy, enemyIndex) => {
            if (isColliding(bullet, enemy)) {
                enemies.splice(enemyIndex, 1);  // Hapus musuh jika tertabrak
                bullets.splice(bulletIndex, 1);  // Hapus peluru yang mengenai musuh
            }
        });
    });
}

function updateEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.x -= enemy.speed;
        if (enemy.x + enemy.width < 0) enemies.splice(index, 1);
    });
}

function drawPlayer() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBullets() {
    ctx.fillStyle = 'red';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

function drawEnemies() {
    ctx.fillStyle = 'green';
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

function gameLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (timestamp - lastSpawn > spawnInterval) {
        spawnEnemy();
        lastSpawn = timestamp;
    }

    updatePlayer();
    updateBullets();
    updateEnemies();

    drawPlayer();
    drawBullets();
    drawEnemies();

    requestAnimationFrame(gameLoop);
}

gameLoop();
