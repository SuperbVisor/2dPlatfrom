const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ukuran canvas
canvas.width = 1200;
canvas.height = 600;


// Player dan elemen game
let player = { 
    x: 50, 
    y: 500, 
    width: 50, 
    height: 50, 
    speed: 5, 
    dx: 0, 
    isJumping: false, 
    dy: 0, 
    jumpHold: false, 
    health: 100, 
    maxHealth: 100, 
    direction: 'right', 
    level: 1, 
    xp: 0, 
    damage: 10,  // Damage peluru pemain
};
let bullets = [];
let enemies = [];
let keys = {};
let gravity = 0.5;
let maxJumpPower = -12;
let minJumpPower = -8;
let maxJumpHoldTime = 300;
let jumpHoldStartTime = null;
let spawnInterval = 10000; // Waktu spawn musuh, 10 detik
let lastSpawn = 0;

// Variabel kamera
let camera = { x: 0, y: 0, width: canvas.width, height: canvas.height };

// Cooldown tembakan
let lastShootTime = 0;
const shootCooldown = 500; // Cooldown tembakan

// Jarak musuh menyerang pemain
const attackRange = 50;

// Damage peluru pemain
const bulletDamage = 15;


document.addEventListener('keydown', (event) => {
    keys[event.key] = true;

    if (event.key === ' ') {
        if (!player.isJumping) {
            player.isJumping = true;
            player.jumpHold = true;
            jumpHoldStartTime = Date.now();
            player.dy = minJumpPower;
        }
    }

    if (event.key === 'Enter') {
        const now = Date.now();
        if (now - lastShootTime > shootCooldown) {
            if (player.direction === 'right') {
                bullets.push({ x: player.x + player.width, y: player.y + player.height / 2, width: 10, height: 5, speed: 7 });
            } else {
                bullets.push({ x: player.x, y: player.y + player.height / 2, width: 10, height: 5, speed: -7 });
            }
            lastShootTime = now;
        }
    }
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;

    if (event.key === ' ') {
        player.jumpHold = false;
    }
});

function spawnEnemy() {
    const enemy = {
        x: camera.x + canvas.width + Math.random() * 300, // Spawn musuh di luar layar
        y: 500,
        width: 50,
        height: 50,
        speed: 2,
        health: 100 * player.level / 1,  // Health musuh berdasarkan level pemain
        maxHealth: 100 * player.level / 1,  // Health max musuh
        damage: 5 * player.level / 1,  // Damage musuh berdasarkan level
        level: player.level
    };
    enemies.push(enemy);
}

// Fungsi untuk mengejar pemain
function chasePlayer(enemy) {
    const playerCenterX = player.x + player.width / 2;
    const playerCenterY = player.y + player.height / 2;
    const enemyCenterX = enemy.x + enemy.width / 2;

    if (Math.abs(playerCenterX - enemyCenterX) < attackRange) {
        // Jika musuh dekat dengan pemain, musuh berhenti bergerak (menyerang)
        enemy.dx = 0;
        // Bisa ditambahkan logika menyerang di sini
    } else {
        // Musuh mengejar pemain
        if (playerCenterX < enemyCenterX) {
            enemy.dx = -enemy.speed; // Musuh bergerak ke kiri
        } else {
            enemy.dx = enemy.speed; // Musuh bergerak ke kanan
        }
    }

    // Update posisi musuh berdasarkan kecepatan dan arah
    enemy.x += enemy.dx;
}

// Update pemain dan musuh
function updatePlayer() {
    if (keys['d']) {
        player.dx = player.speed;
        player.direction = 'right'; // Pemain menghadap kanan
    } else if (keys['a']) {
        player.dx = -player.speed;
        player.direction = 'left'; // Pemain menghadap kiri
    } else {
        player.dx = 0;
    }

    if (player.isJumping) {
        if (player.jumpHold && Date.now() - jumpHoldStartTime <= maxJumpHoldTime) {
            if (player.dy > maxJumpPower) {
                player.dy -= 0.5;
                
            }
        }

        player.dy += gravity;
        player.y += player.dy;

        if (player.y >= 500) {
            player.isJumping = false;
            player.jumpHold = false;
            player.y = 500;
            player.dy = 0;
        }
    }

    player.x += player.dx;

    // Update posisi kamera agar mengikuti pemain
    camera.x = player.x - canvas.width / 2 + player.width / 2;

    // Pastikan kamera tidak keluar batas dunia
    if (camera.x < 0) camera.x = 0;
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

        if (bullet.x > camera.x + canvas.width || bullet.x < camera.x) {
            bullets.splice(bulletIndex, 1);
        }

        enemies.forEach((enemy, enemyIndex) => {
            if (isColliding(bullet, enemy)) {
                enemy.health -= player.damage; // Kurangi kesehatan musuh berdasarkan damage peluru
                bullets.splice(bulletIndex, 1);
                if (enemy.health <= 0) {
                    enemies.splice(enemyIndex, 1); // Musuh mati jika kesehatan habis
                    player.xp += 10; // Pemain mendapatkan XP setelah membunuh musuh
                    levelUp(); // Mengecek apakah pemain naik level
                }
            }
        });
    });
}

function updateEnemies() {
    enemies.forEach((enemy) => {
        chasePlayer(enemy); // Musuh mengejar pemain
    });
}

function drawPlayer() {
    ctx.fillStyle = 'blue';
    ctx.fillRect(player.x - camera.x, player.y - camera.y, player.width, player.height);
}

function drawBullets() {
    ctx.fillStyle = 'red';
    bullets.forEach(bullet => {
        ctx.fillRect(bullet.x - camera.x, bullet.y - camera.y, bullet.width, bullet.height);
    });
}

function drawEnemies() {
    ctx.fillStyle = 'green';
    enemies.forEach(enemy => {
        ctx.fillRect(enemy.x - camera.x, enemy.y - camera.y, enemy.width, enemy.height);

        // Menampilkan health bar musuh dengan ukuran lebih proporsional
        const healthBarWidth = 40;
        const healthBarHeight = 5;
        const healthBarX = enemy.x - camera.x + (enemy.width - healthBarWidth) / 2;
        const healthBarY = enemy.y - camera.y - 10;

        // Menggambar background health bar
        ctx.fillStyle = 'black';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth, healthBarHeight);

        // Menggambar health bar berdasarkan persentase health
        ctx.fillStyle = 'red';
        ctx.fillRect(healthBarX, healthBarY, healthBarWidth * (enemy.health / enemy.maxHealth), healthBarHeight);

        // Menampilkan level musuh di atas health bar
        ctx.fillStyle = 'white';
        ctx.font = '16px "Press Start 2P"'; // Font pixel
        ctx.fillText(`Lvl: ${enemy.level}`, healthBarX + (healthBarWidth - ctx.measureText(`Lvl: ${enemy.level}`).width) / 2, healthBarY - 5);
    });
}

function drawPlayerUI() {
    // Health Bar
    ctx.fillStyle = 'red';
    ctx.fillRect(10, 10, 200 * (player.health / player.maxHealth), 20); // Health bar

    // XP Bar
    ctx.fillStyle = 'cyan';
    ctx.fillRect(10, 40, 200 * (player.xp / 100), 20); // XP bar

    // Teks Level
    ctx.fillStyle = 'white';
    ctx.font = '16px "Press Start 2P"'; // Font pixel
    ctx.fillText(`Lvl: ${player.level}`, 10, 70);
}

// Fungsi untuk level up
function levelUp() {
    if (player.xp >= 100) {
        player.level += 1;
        player.xp = 0;
        player.maxHealth += player.maxHealth * 0.05; // Tambah 5% HP
        player.health = player.maxHealth;
        player.damage += 5; // Tambah 5 damage peluru
    }
}

function drawBackground() {
    // Membuat gradasi dari atas ke bawah
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB'); // Warna terang di atas (biru muda)
    gradient.addColorStop(1, '#0b2a2c'); // Warna gelap di bawah (hijau gelap)

    // Menggambar background menggunakan gradasi
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// Respawn dan game loop
function gameLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Gambar background gradasi terlebih dahulu
    drawBackground();

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
    drawPlayerUI(); // Gambar UI (Health bar, XP bar)

    requestAnimationFrame(gameLoop);
}

gameLoop();
