const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playerImage = new Image();
const enemyImage = new Image();
const playerRunImage = new Image();
const playerJumpImage = new Image();
const playerFallImage = new Image();
const hitImage = new Image();
const enemyHitImage = new Image();
const enemyDeadImage = new Image();
const backgroundImage = new Image();
const bulletImage = new Image();

const jumpSound = new Audio('static/sounds/jump.wav');
const hurtSound = new Audio('static/sounds/hurt.wav'); 
const shootSound = new Audio('static/sounds/shoot.wav');
const enemyHitSound = new Audio('static/sounds/enehit.wav');
const enemyDeathSound = new Audio('static/sounds/disaper.wav');
const stepSound = new Audio('static/sounds/step1.wav');
const groundSound = new Audio('static/sounds/grund.wav');

const bgm = new Audio('static/sounds/bgm/timeofadven.mp3');

backgroundImage.src = 'static/img/background/brown.png';
enemyDeadImage.src = 'static/img/enemy img/dead.png';
enemyHitImage.src = 'static/img/enemy img/hit.png';
hitImage.src = 'static/img/player img/hit.png';
playerFallImage.src = 'static/img/player img/fall.png';
playerJumpImage.src = 'static/img/player img/jump.png';
playerRunImage.src = 'static/img/player img/run.png';
enemyImage.src = 'static/img/enemy img/Idle.png'; // Path ke gambar animasi musuh
playerImage.src = 'static/img/player img/Idle.png'; // Ganti dengan path ke gambar animasi Anda
bulletImage.src = 'static/img/bullets/stone1.png';


canvas.width = 1200;
canvas.height = 600;

const enemyDeadAnimationSpeed = 20; // Kecepatan animasi saat mati
let enemyDeadFrameCounter = 0; // Untuk menghitung frame animasi mati
let enemyDeadCurrentFrame = 0; // Frame saat ini untuk animasi mati
const enemyDeadTotalFrames = 4;


let enemyIsHit = false;
let enemyHitFrameCounter = 0;
const enemyHitAnimationSpeed = 10; // Kecepatan animasi saat terkena hit
let enemyHitCurrentFrame = 0; // Frame saat ini untuk animasi terkena hit
const enemyHitTotalFrames = 5;

let isHit = false;
let hitFrameCounter = 0;
const hitAnimationSpeed = 5; // Kecepatan animasi saat terkena hit
let hitCurrentFrame = 0; // Frame saat ini untuk animasi terkena hit
const hitTotalFrames = 7;

let jumpPowerTap = -8; // Daya lompatan untuk tap spasi
let jumpPowerHold = -12; // Daya lompatan untuk hold spasi

const runTotalFrames = 12; // Misalnya ada 8 frame dalam animasi berlari
let runCurrentFrame = 0; // Frame saat ini untuk animasi berlari
let runAnimationSpeed = 5; // Kecepatan animasi berlari
let runFrameCounter = 0; // Untuk menghitung frame animasi berlari

let lastStepTime = 0;
const stepCooldown = 340;

let currentFrame = 0;
const totalFrames = 11; // Misalnya ada 11 frame dalam animasi
const frameWidth = 32; // Lebar setiap frame
const frameHeight = 32; // Tinggi setiap frame
let animationSpeed = 10; // Mengatur kecepatan animasi
let frameCounter = 0; // Untuk menghitung frame

const enemyTotalFrames = 10; // Misalnya ada 11 frame dalam animasi musuh
let enemyCurrentFrame = 0; // Frame saat ini untuk musuh
let enemyAnimationSpeed = 10; // Kecepatan animasi musuh
let enemyFrameCounter = 0; // Untuk menghitung frame animasi musuh
const enemyFrameWidth = 44; // Lebar setiap frame musuh
const enemyFrameHeight = 30; // Tinggi setiap frame musuh

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
    damage: 10,  
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
const shootCooldown = 1000; // Cooldown tembakan

// Jarak musuh menyerang pemain
const attackRange = 50;

// Damage peluru pemain
const bulletDamage = 15;

// Damage musuh
const enemyDamage = 5;

const platforms = [
    { x: 100, y: 400, width: 200, height: 20 }, // Platform pertama
    { x: 500, y: 300, width: 150, height: 20 }, // Platform kedua
    // ... tambahkan platform lainnya ...
];

document.addEventListener('keydown', (event) => {
    keys[event.key] = true;

    if (event.key === ' ' && !player.isJumping) {
        player.isJumping = true;
        player.jumpHold = true;
        jumpHoldStartTime = Date.now();
        player.dy = jumpPowerTap; // Gunakan daya lompatan untuk tap

        // Mainkan suara lompat
        jumpSound.play(); 
    }

    if (event.key === 'Enter') {
        const now = Date.now();
        if (now - lastShootTime > shootCooldown) {
            bullets.push({ 
                x: player.x + (player.direction === 'right' ? player.width : 0), 
                y: player.y + player.height / 2, 
                width: 10, 
                height: 5, 
                speed: player.direction === 'right' ? 7 : -7 
            });
            lastShootTime = now;
            shootSound.play(); 
        }
    }
});

document.addEventListener('keyup', (event) => {
    keys[event.key] = false;

    if (event.key === ' ') {
        // Jika tombol spasi dilepas, gunakan daya lompatan untuk hold
        if (player.jumpHold) {
            player.dy = jumpPowerHold; // Gunakan daya lompatan untuk hold
        }
        player.jumpHold = false;
    }
});

function startGame() {
    bgm.loop = true; // Loop BGM
    bgm.play();
  }

function spawnEnemy() {
    const enemy = {
        x: camera.x + canvas.width + Math.random() * 300,
        y: 500,
        width: enemyFrameWidth,
        height: enemyFrameHeight,
        speed: 2,
        health: 50 * player.level,
        maxHealth: 100 * player.level,
        damage: 5 * player.level,
        level: player.level,
        lastAttackTime: 0,
        attackCooldown: 1000,
        currentFrame: 0,
        direction: 'left',
        isDead: false // Tambahkan properti ini
    };
    enemies.push(enemy);
}

// Fungsi untuk menggambar platform
function drawPlatforms() {
    platforms.forEach(platform => {
      ctx.fillStyle = 'brown'; // Warna platform
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height); 
    });
  }
  
  // Fungsi untuk memeriksa tabrakan pemain dengan platform
  function checkPlatformCollision() {
    platforms.forEach(platform => {
      // Periksa apakah pemain berada di atas platform
      if (player.x + player.width > platform.x &&
          player.x < platform.x + platform.width &&
          player.y + player.height > platform.y &&
          player.y + player.height < platform.y + platform.height) {
        // Jika tabrakan, atur posisi pemain di atas platform
        player.y = platform.y - player.height;
        player.isJumping = false; // Hentikan lompatan
        player.dy = 0; // Atur kecepatan vertikal menjadi 0
        groundSound.play();
      }
    });
  }

function handlePlayerAttack(enemy) {
    if (enemy.health > 0) {
        enemy.health -= bulletDamage;
        enemyIsHit = true; // Set status terkena hit
        enemyHitCurrentFrame = 0; // Reset frame animasi hit
        enemyHitSound.play(); 
    }

    // Jika kesehatan musuh <= 0, set status mati
    if (enemy.health <= 0) {
        enemy.isDead = true; // Set status mati untuk musuh ini
        enemyDeadCurrentFrame = 0; // Reset frame animasi mati
        enemyDeathSound.play(); 
    }
}

function handleEnemyAttack(enemy) {
    const now = Date.now();
    if (now - enemy.lastAttackTime > enemy.attackCooldown) {
        enemy.lastAttackTime = now;
        player.health -= enemy.damage; // Musuh menyerang pemain
        isHit = true; // Set status terkena hit
        hitCurrentFrame = 0; // Reset frame animasi hit

        // Mainkan suara terkena hit
        hurtSound.play(); 
    }
}

// Fungsi untuk mengejar pemain
function chasePlayer(enemy) {
    const playerCenterX = player.x + player.width / 2;
    const enemyCenterX = enemy.x + enemy.width / 2;

    if (playerCenterX < enemyCenterX) {
        enemy.direction = 'right';
        enemy.dx = -enemy.speed;
    } else {
        enemy.direction = 'left';
        enemy.dx = enemy.speed;
    }

    if (Math.abs(playerCenterX - enemyCenterX) < attackRange) {
        if (player.y + player.height < enemy.y) {
            return;
        } else {
            handleEnemyAttack(enemy); // Panggil fungsi untuk menangani serangan
        }
    }

    enemy.x += enemy.dx;
}

// Fungsi untuk memperbarui posisi dan status pemain
function updatePlayer() {
    if (keys['d']) {
        player.dx = player.speed;
        player.direction = 'right';
    } else if (keys['a']) {
        player.dx = -player.speed;
        player.direction = 'left';
    } else {
        player.dx = 0;
    }
    if (player.dx !== 0) {
        const now = Date.now();
        if (now - lastStepTime > stepCooldown) {
            // Mainkan suara langkah kaki
            stepSound.play(); 
            lastStepTime = now; // Reset waktu terakhir langkah
        }
    }

    if (player.isJumping) {
        if (player.jumpHold) {
            const holdTime = Date.now() - jumpHoldStartTime;
            if (holdTime < maxJumpHoldTime) {
                player.dy = Math.max(player.dy, jumpPowerHold); // Gunakan daya lompatan untuk hold
            } else {
                player.jumpHold = false; // Jika sudah lebih dari waktu hold, lepas
            }
        }
        player.dy += gravity;
        player.y += player.dy;

        if (player.y >= 500) {
            player.y = 500;
            player.isJumping = false;
            player.dy = 0;
            groundSound.play();
        }
    }

    player.x += player.dx;
    player.x = Math.max(0, Math.min(canvas.width - player.width, player.x)); // Membatasi gerakan pemain dalam batas kanvas
}

// Fungsi untuk memperbarui peluru dan memeriksa tabrakan
function updateBullets() {
    bullets.forEach((bullet, bulletIndex) => {
        bullet.x += bullet.speed;
        if (bullet.x > canvas.width || bullet.x < 0) {
            bullets.splice(bulletIndex, 1);
        } else {
            enemies.forEach((enemy, enemyIndex) => {
                if (bullet.x < enemy.x + enemy.width && bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height && bullet.y + bullet.height > enemy.y) {
                    handlePlayerAttack(enemy);
                    bullets.splice(bulletIndex, 1);
                    if (enemy.health <= 0) {
                        enemies.splice(enemyIndex, 1);
                    }
                }
            });
        }
    });
}

function drawWeaponIcon() {
    const iconSize = 50; // Ukuran ikon senjata
    const iconX = canvas.width - iconSize - 10; // Posisi X ikon
    const iconY = 10; // Posisi Y ikon

    ctx.drawImage(bulletImage, iconX, iconY, iconSize, iconSize); // Gambar ikon "bullet"
}

function drawPlayer() {
    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
    ctx.scale(player.direction === 'left' ? -1 : 1, 1);

    if (isHit) {
        hitFrameCounter++;
        if (hitFrameCounter >= hitAnimationSpeed) {
            hitCurrentFrame = (hitCurrentFrame + 1) % hitTotalFrames; // Update frame animasi hit
            hitFrameCounter = 0;
            if (hitCurrentFrame === 0) {
                isHit = false; // Kembali ke status normal setelah selesai animasi
            }
        }
        ctx.drawImage(hitImage, hitCurrentFrame * frameWidth, 0, frameWidth, frameHeight, -player.width / 2, -player.height / 2, player.width, player.height); // Gambar animasi hit
    } else {
        // Gambar animasi normal
        if (player.isJumping) {
            ctx.drawImage(playerJumpImage, 0, 0, 32, 32, -player.width / 2, -player.height / 2, player.width, player.height);
          } else if (player.dx !== 0) {
            ctx.drawImage(playerRunImage, runCurrentFrame * 32, 0, 32, 32, -player.width / 2, -player.height / 2, player.width, player.height);
          } else if (player.dy > 0) {
            ctx.drawImage(playerFallImage, 0, 0, 32, 32, -player.width / 2, -player.height / 2, player.width, player.height);
          } else {
            ctx.drawImage(playerImage, currentFrame * frameWidth, 0, frameWidth, frameHeight, -player.width / 2, -player.height / 2, player.width, player.height);
          }
           // Gambar bullet di tangan pemain
      }

    ctx.restore();
}

function drawEnemies() {
    enemies.forEach((enemy, enemyIndex) => {
        ctx.save(); // Simpan konteks
        ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2); // Pindahkan titik referensi ke tengah musuh
        ctx.scale(enemy.direction === 'left' ? -1 : 1, 1); // Membalik gambar musuh jika menghadap kiri

        if (enemy.isDead) {
            enemyDeadFrameCounter++;
            if (enemyDeadFrameCounter >= enemyDeadAnimationSpeed) {
                enemyDeadCurrentFrame = (enemyDeadCurrentFrame + 1) % enemyDeadTotalFrames; // Update frame animasi mati
                enemyDeadFrameCounter = 0;

                // Jika sudah mencapai frame terakhir, hapus musuh dari array
                if (enemyDeadCurrentFrame === 0) {
                    enemies.splice(enemyIndex, 1); // Menghapus musuh yang mati dari array
                }
            }
            ctx.drawImage(enemyDeadImage, enemyDeadCurrentFrame * enemyFrameWidth, 0, enemyFrameWidth, enemyFrameHeight, -enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height); // Gambar animasi mati
        } else if (enemyIsHit) {
            enemyHitFrameCounter++;
            if (enemyHitFrameCounter >= enemyHitAnimationSpeed) {
                enemyHitCurrentFrame = (enemyHitCurrentFrame + 1) % enemyHitTotalFrames; // Update frame animasi hit
                enemyHitFrameCounter = 0;
                if (enemyHitCurrentFrame === 0) {
                    enemyIsHit = false; // Kembali ke status normal setelah selesai animasi
                }
            }
            ctx.drawImage(enemyHitImage, enemyHitCurrentFrame * enemyFrameWidth, 0, enemyFrameWidth, enemyFrameHeight, -enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height); // Gambar animasi hit
        } else {
            ctx.drawImage(enemyImage, enemy.currentFrame * enemyFrameWidth, 0, enemyFrameWidth, enemyFrameHeight, -enemy.width / 2, -enemy.height / 2, enemy.width, enemy.height); // Gambar animasi normal
        }

        ctx.restore(); // Kembalikan konteks ke keadaan semula
    });
}

// Fungsi untuk memperbarui posisi musuh
function updateEnemies() {
    enemies.forEach((enemy) => {
        chasePlayer(enemy);
        enemyFrameCounter++;
        if (enemyFrameCounter >= enemyAnimationSpeed) {
            enemy.currentFrame = (enemy.currentFrame + 1) % enemyTotalFrames; // Perbarui frame animasi musuh
            enemyFrameCounter = 0;
        }
    });
}

// Fungsi untuk menggambar semua elemen
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Menggambar background
    for (let x = 0; x < canvas.width; x += 64) {
        for (let y = 0; y < canvas.height; y += 64) {
            ctx.drawImage(backgroundImage, x, y, 64, 64);
        }
    }

    // Menggambar pemain
    drawPlayer();

    // Menggambar peluru
    bullets.forEach((bullet) => {
        ctx.drawImage(bulletImage, bullet.x, bullet.y, 20, 20); // Gambar peluru dengan gambar
    });

    // Menggambar musuh
    drawEnemies(); // Gambar semua musuh
    drawWeaponIcon();

    // Menggambar health bar pemain
    const healthBarWidth = 200; // Lebar health bar
    const healthBarHeight = 20; // Tinggi health bar
    const healthBarX = 10; // Posisi X health bar
    const healthBarY = 40; // Posisi Y health bar
    const radius = 10; // Radius sudut

    // Gambar background health bar
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 5;
    ctx.stroke(); 
    roundRect(ctx, healthBarX, healthBarY, healthBarWidth, healthBarHeight, radius);

    // Gambar health bar yang terisi
    const healthPercentage = player.health / player.maxHealth; // Hitung persentase kesehatan
    ctx.fillStyle = 'green';
    roundRect(ctx, healthBarX, healthBarY, healthBarWidth * healthPercentage, healthBarHeight, radius); // Gambar health bar yang terisi

}

function roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
    ctx.fill();
}

// Fungsi untuk memperbarui animasi
function updateAnimation() {
    frameCounter++;
    if (frameCounter >= animationSpeed) {
        currentFrame = (currentFrame + 1) % totalFrames;
        frameCounter = 0;
    }

    // Update animasi berlari
    if (player.dx !== 0) {
        runFrameCounter++;
        if (runFrameCounter >= runAnimationSpeed) {
            runCurrentFrame = (runCurrentFrame + 1) % runTotalFrames; // Perbarui frame animasi berlari
            runFrameCounter = 0;
        }
    }
}

// Fungsi utama untuk menjalankan game loop
function gameLoop(timestamp) {
    if (timestamp - lastSpawn > spawnInterval) {
        spawnEnemy();
        lastSpawn = timestamp;
    }
    
    startGame();
    updateAnimation(); // Memperbarui animasi
    updatePlayer();
    updateEnemies();
    updateBullets();
    draw();
    drawPlatforms();
    checkPlatformCollision();

    requestAnimationFrame(gameLoop);
}

// Memulai game loop
requestAnimationFrame(gameLoop);