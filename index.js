const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const gravity = 1.5

class Player {
    constructor() {
        this.position = { x: 100, y: 100 }
        this.velocity = { x: 0, y: 0 }
        this.width = 30
        this.height = 30
        this.isOnGround = false // Track if the player is on the ground
    }
    
    draw() {
        c.fillStyle = 'red'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    
    update() {
        this.draw()
        
        // Update position
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        
        // Handle gravity
        if (this.position.y + this.height + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity
            this.isOnGround = false
        } else {
            this.velocity.y = 0
            this.isOnGround = true
        }
    }
}

class Platform {
    constructor({x, y}) {
        this.position = { x, y }
        this.width = 200
        this.height = 20
    }
    
    draw() {
        c.fillStyle = 'blue'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}

const player = new Player()
const platforms = [new Platform({x:200, y:100}), new Platform({x:500, y:200})]

const keys = {
    right: { pressed: false },
    left: { pressed: false }
}

let scrollOfset = 0

function animate() {
    requestAnimationFrame(animate)
    c.clearRect(0, 0, canvas.width, canvas.height)
    player.update()
    platforms.forEach(platform => {
        platform.draw()
    })

    // Handle horizontal movement
    if (keys.right.pressed && player.position.x < 400) {
        player.velocity.x = 5
    } else if (keys.left.pressed && player.position.x > 100) {
        player.velocity.x = -5
    } else {
        player.velocity.x = 0
    }

    // Move platforms based on keypresses
    if (keys.right.pressed) {
        scrollOfset += 5
        platforms.forEach(platform => {
            platform.position.x -= 5
        })
    } else if (keys.left.pressed) {
            scrollOfset -= 5

        platforms.forEach(platform => {
            platform.position.x += 5
        })
    }

    // Platform collision detection
    platforms.forEach(platform => {
        if (player.position.y + player.height <= platform.position.y && 
            player.position.y + player.height + player.velocity.y >= platform.position.y && 
            player.position.x + player.width >= platform.position.x && 
            player.position.x < platform.position.x + platform.width) {
            player.velocity.y = 0
            player.position.y = platform.position.y - player.height // Correct position to stand on the platform
            player.isOnGround = true
        }
    })
    if (scrollOfset > 2000){
        console.log ('you win')
    }
}

animate()

addEventListener('keydown', (event) => {
    const { keyCode } = event
    switch (keyCode) {
        case 65: // 'A' key for left
            keys.left.pressed = true
            break

        case 68: // 'D' key for right
            keys.right.pressed = true
            break

        case 87: // 'W' key for jump
            if (player.isOnGround) { // Only allow jumping when grounded
                console.log('up')
                player.velocity.y -= 20
                player.isOnGround = false
            }
            break
    }
})

addEventListener('keyup', (event) => {
    const { keyCode } = event
    switch (keyCode) {
        case 65: // 'A' key for left
            keys.left.pressed = false
            break

        case 68: // 'D' key for right
            keys.right.pressed = false
            break

        case 87: // 'W' key for jump
            break // No need to handle jump in keyup
    }
})
