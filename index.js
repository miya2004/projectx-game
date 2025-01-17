// Load player images
const standingImage = new Image();
standingImage.src = 'standing.png'; // Ensure this path is correct

const runningLeftImage = new Image();
runningLeftImage.src = 'runningleft.png'; // Ensure this path is correct

const runningRightImage = new Image();
runningRightImage.src = 'runningright.png'; // Ensure this path is correct

const groundHeight = 50; // Height of the ground

const enemyImage = new Image();
enemyImage.src = 'enemy.png'; // Load the enemy image

const coinImage = new Image();
coinImage.src = 'coin.png'; // Load the coin image

// Load heart image
const heartImage = new Image();
heartImage.src = 'redheart.png'; // Ensure this path is correct

const backgroundImage = new Image();
backgroundImage.src = 'space.jpg'; // Ensure this path is correct

const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

const gravity = 1.5;

let lives = 3; // Player starts with 3 lives

class Player {
    constructor() {
        this.position = { x: 100, y: canvas.height - groundHeight - this.height }; // Start position above the ground
        this.velocity = { x: 0, y: 0 };
        this.width = 66; // Standing width
        this.widthr = 127.875; // Running width
        this.height = 150;
        this.speed = 5;
        this.jumpStrength = -20;
        this.doubleJumpStrength = -30;
        this.isOnGround = false;
        this.jumpCount = 0;
        this.facingLeft = false;
        this.facingRight = false;
    }

    draw() {
        if (this.facingLeft) {
            c.drawImage(runningLeftImage, 0, 0, 340, 400, this.position.x, this.position.y, this.widthr, this.height); // Running left
        } else if (this.facingRight) {
            c.drawImage(runningRightImage, 0, 0, 340, 400, this.position.x, this.position.y, this.widthr, this.height); // Running right
        } else {
            c.drawImage(standingImage, 0, 0, 177, 400, this.position.x, this.position.y, this.width, this.height); // Standing still
        }
    }

    update() {
        this.draw();
        this.position.x += this.velocity.x;
        this.position.y += this.velocity.y;

        if (this.position.y + this.height + this.velocity.y < canvas.height - groundHeight) {
            this.velocity.y += gravity;
            this.isOnGround = false;
        } else {
            this.velocity.y = 0;
            this.isOnGround = true;
            this.jumpCount = 0;
            this.position.y = canvas.height - groundHeight - this.height;
        }
    }
}

class Platform {
    constructor({ x, y, image }) {
        this.position = { x, y };
        this.image = image;
        this.width = image.width;
        this.height = image.height;
    }

    draw() {
        c.drawImage(this.image, this.position.x, this.position.y);
    }
}

class Enemy {
    constructor({ x, y, width, height, speed }) {
        this.position = { x, y };
        this.width = width;
        this.height = height;
        this.speed = speed;
        this.direction = 1; // 1 for right, -1 for left
    }

    draw() {
        c.drawImage(enemyImage, this.position.x, this.position.y, this.width, this.height);
    }

    update() {
        this.draw();
        this.position.x += this.speed * this.direction;

        // Reverse direction if the enemy hits the edges of the canvas
        if (this.position.x <= 0 || this.position.x + this.width >= canvas.width) {
            this.direction *= -1;
        }
    }
}

class Coin {
    constructor({ x, y }) {
        this.position = { x, y };
        this.width = 30; // Coin width
        this.height = 30; // Coin height
    }

    draw() {
        c.drawImage(coinImage, this.position.x, this.position.y, this.width, this.height);
    }
}

let platformImage = new Image();
platformImage.src = 'platlong.png';

let player;
let platforms;
let enemies;
let coins;
let scrollOffset;
let animationId;
let coinCount = 0;

// Initialize the game
function init() {
    cancelAnimationFrame(animationId); // Stop the previous animation loop

    player = new Player();
    platforms = [
        new Platform({ x: -1, y: 440, image: platformImage }),
        new Platform({ x: 768, y: 440, image: platformImage }),
        new Platform({ x: 768 * 2 + 120, y: 440, image: platformImage }),
    ];
    enemies = [
        new Enemy({ x: 500, y: 410, width: 80, height: 90, speed: 3 }),
        new Enemy({ x: 900, y: 410, width: 80, height: 90, speed: 4 }),
    ];
    coins = [
        new Coin({ x: 600, y: 400 }),
        new Coin({ x: 850, y: 400 }),
    ];
    scrollOffset = 0;
    coinCount = 0;
    lives = 3; // Reset lives

    animate();
}

// Add platforms dynamically as the player progresses
function addPlatforms() {
    const lastPlatform = platforms[platforms.length - 1];
    platforms.push(
        new Platform({
            x: lastPlatform.position.x + lastPlatform.width + 180,
            y: 440,
            image: platformImage,
        })
    );
}

function addEnemies() {
    const lastEnemy = enemies[enemies.length - 1];
    const newEnemyX = lastEnemy.position.x + 1000; // Position new enemy further ahead
    const newEnemyY = 410; // Position at the same height as the platforms
    const newEnemyWidth = 80; // Width of the enemy
    const newEnemyHeight = 90; // Height of the enemy
    const newEnemySpeed = Math.random() * 1 + 1; // Random speed between 2 and 4

    enemies.push(
        new Enemy({
            x: newEnemyX,
            y: newEnemyY,
            width: newEnemyWidth,
            height: newEnemyHeight,
            speed: newEnemySpeed,
        })
    );
}

function addCoins() {
    const lastCoin = coins[coins.length - 1];
    coins.push(
        new Coin({
            x: lastCoin.position.x + 300,
            y: 400,
        })
    );
}

// Animation loop
function animate() {
    animationId = requestAnimationFrame(animate);

    // Draw background image
    c.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);

    platforms.forEach((platform) => {
        platform.draw();
    });

    enemies.forEach((enemy) => {
        enemy.update();
    });

    coins.forEach((coin, index) => {
        coin.draw();

        // Coin collection detection
        if (
            player.position.x + player.width > coin.position.x &&
            player.position.x < coin.position.x + coin.width &&
            player.position.y + player.height > coin.position.y &&
            player.position.y < coin.position.y + coin.height
        ) {
            coins.splice(index, 1); // Remove the coin from the array
            coinCount += 1; // Increase the coin count
        }
    });

    player.update();

    // Display coin count in the top-right corner
    c.fillStyle = 'white';
    c.font = '24px NickelodeonFont bold';
    c.fillText(`Ice Creams: ${coinCount}`, canvas.width - 190, 40);

    // Display hearts in the top-left corner
    for (let i = 0; i < lives; i++) {
        c.drawImage(heartImage, 10 + i * 40, 10, 30, 30); // Spacing hearts horizontally
    }

    if (keys.right.pressed && player.position.x < 400) {
        player.velocity.x = 10;
    } else if (keys.left.pressed && player.position.x > 100) {
        player.velocity.x = -10;
    } else {
        player.velocity.x = 0;

        if (keys.right.pressed) {
            scrollOffset += 10;

            platforms.forEach((platform) => {
                platform.position.x -= 10;
            });
            enemies.forEach((enemy) => {
                enemy.position.x -= 10;
            });
            coins.forEach((coin) => {
                coin.position.x -= 10;
            });

            const lastPlatform = platforms[platforms.length - 1];
            if (lastPlatform.position.x + lastPlatform.width < canvas.width) {
                addPlatforms();
            }

            const lastEnemy = enemies[enemies.length - 1];
            if (lastEnemy.position.x < canvas.width) {
                addEnemies();
            }

            const lastCoin = coins[coins.length - 1];
            if (lastCoin.position.x < canvas.width) {
                addCoins();
            }
        } else if (keys.left.pressed) {
            scrollOffset -= 10;

            platforms.forEach((platform) => {
                platform.position.x += 10;
            });
            enemies.forEach((enemy) => {
                enemy.position.x += 10;
            });
            coins.forEach((coin) => {
                coin.position.x += 10;
            });
        }
    }

    platforms.forEach((platform) => {
        if (
            player.position.y + player.height <= platform.position.y &&
            player.position.y + player.height + player.velocity.y >= platform.position.y &&
            player.position.x + player.width >= platform.position.x &&
            player.position.x <= platform.position.x + platform.width
        ) {
            player.velocity.y = 0;
        }
    });

    enemies.forEach((enemy, index) => {
        if (
            player.position.x + player.width > enemy.position.x &&
            player.position.x < enemy.position.x + enemy.width &&
            player.position.y + player.height > enemy.position.y &&
            player.position.y < enemy.position.y + enemy.height
        ) {
            console.log('Player hit an enemy!');
            lives -= 1; // Reduce a life

            if (lives <= 0) {
                console.log('Game Over! Restarting...');
                init(); // Restart the game if the player runs out of lives
            } else {
                enemies.splice(index, 1); // Remove the enemy
            }
        }
    });

    if (player.position.y > canvas.height) {
        console.log('Game Over! Restarting...');
        init();
    }
}

const keys = {
    right: { pressed: false },
    left: { pressed: false },
};

addEventListener('keydown', ({ keyCode }) => {
    switch (keyCode) {
        case 65: // 'A' key
            keys.left.pressed = true;
            break;
        case 68: // 'D' key
            keys.right.pressed = true;
            break;
        case 87: // 'W' key
            if (player.velocity.y === 0) {
                player.velocity.y = -20;
            }
            break;
    }
});

addEventListener('keyup', ({ keyCode }) => {
    switch (keyCode) {
        case 65: // 'A' key
            keys.left.pressed = false;
            break;
        case 68: // 'D' key
            keys.right.pressed = false;
            break;
    }
});

// Start the game

platformImage.onload = () => {
    init();
};
