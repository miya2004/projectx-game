const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;

const gravity = 1.5;

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

let platformImage = new Image();
platformImage.src = 'platlong.png';

let player;
let platforms;
let enemies;
let scrollOffset;
let animationId;

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
    scrollOffset = 0;

    animate();
}

// Add platforms dynamically as the player progresses
function addPlatforms() {
    const lastPlatform = platforms[platforms.length - 1];
    platforms.push(
        new Platform({
            x: lastPlatform.position.x + lastPlatform.width + 120,
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
    const newEnemySpeed = Math.random() * 1 + 2; // Random speed between 2 and 4

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


// Animation loop
function animate() {
    animationId = requestAnimationFrame(animate);
    c.fillStyle = 'white';
    c.fillRect(0, 0, canvas.width, canvas.height);

    platforms.forEach((platform) => {
        platform.draw();
    });

    enemies.forEach((enemy) => {
        enemy.update();
    });

    player.update();

   
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
    
            // Dynamically add new platforms when necessary
            const lastPlatform = platforms[platforms.length - 1];
            if (lastPlatform.position.x + lastPlatform.width < canvas.width) {
                addPlatforms();
            }
    
            // Dynamically add new enemies when necessary
            const lastEnemy = enemies[enemies.length - 1];
            if (lastEnemy.position.x < canvas.width) {
                addEnemies();
            }
        } else if (keys.left.pressed) {
            scrollOffset -= 10;
    
            platforms.forEach((platform) => {
                platform.position.x += 10;
            });
            enemies.forEach((enemy) => {
                enemy.position.x += 10;
            });
        }
    }
    
    // Platform collision detection
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

    // Enemy collision detection
    enemies.forEach((enemy) => {
        if (
            player.position.x + player.width > enemy.position.x &&
            player.position.x < enemy.position.x + enemy.width &&
            player.position.y + player.height > enemy.position.y &&
            player.position.y < enemy.position.y + enemy.height
        ) {
            console.log('Game Over! Restarting...');
            init(); // Restart the game if the player touches an enemy
        }
    });

    // Restart the game if the player falls
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
