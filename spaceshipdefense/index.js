console.log(gsap)
const canvas = document.querySelector('canvas')
console.log(canvas)
canvas.width = innerWidth
canvas.height = innerHeight
const c = canvas.getContext('2d')
const scoreEl = document.getElementById('scoreEl')
const modalEl = document.getElementById('modalEl');
const frontscore = document.getElementById('frontscore')
const buttonEl = document.getElementById('buttonEl')
const startButton = document.getElementById('startButton')
const startEl = document.getElementById('startEl')

class Player {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y

    this.radius = radius
    this.color = color
    this.velocity = {
      x: 0,
      y: 0
    }
  }
  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill()
  }
  update() {
    
    this.draw()
    const friction = 0.99

    this.velocity.x *= friction
    this.velocity.y *= friction
    
    if (
      this.x + this.radius + this.velocity.x <= canvas.width && 
      this.x - this.radius + this.velocity.x >= 0) {
      this.x += this.velocity.x
    } else {
      this.velocity.x = 0
    } 

    if (
      this.y + this.radius + this.velocity.y <= canvas.height && 
      this.y - this.radius + this.velocity.y >= 0) {
        this.y += this.velocity.y
      } else {
        this.velocity.y = 0
      }
    }
  }

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }
  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill() 
  }
  update() {
    this.draw()
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.type = 'Linear'
    if (Math.random() < 0.5) {
      this.type = 'Homing'
    }
  }
  draw() {
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill() 
  }
  update() {
    this.draw()
    if (this.type === 'Homing') {
      const angle = Math.atan2(player.y - this.y, player.x - this.x)
      this.velocity.x = Math.cos(angle)
      this.velocity.y = Math.sin(angle)
  }
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
  }
}

const friction = 0.99
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.alpha = 1
  }
  draw() {
    c.save()
    c.globalAlpha = this.alpha
    c.beginPath()
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
    c.fillStyle = this.color
    c.fill() 
    c.restore()
  }
  update() {
    this.draw()
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.x = this.x + this.velocity.x
    this.y = this.y + this.velocity.y
    this.alpha -= 0.01
  }
}

const x = canvas.width / 2
const y = canvas.height / 2


/* const projectile = new Projectile(canvas.width/2, canvas.height/2, 5, 'red', {
  x: 1,
  y: 1
}) */
let player = new Player(x, y, 10, 'white')
let projectiles = []
let enemies = []
let particles = []
let animationId
let inervalId
let score = 0;

function init() {
  player = new Player(x, y, 10, 'white')
  projectiles = []
  enemies = []
  particles = []
  animationId
  score = 0;
}
  
  


function spawnEnemies() {
  intervalId = setInterval(() => {
    const radius = Math.random() * (30 - 4) + 4
    let x
    let y
    if (Math.random() < 0.5) {
      x = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
      y = Math.random() * canvas.height
    } else {
      x = Math.random() * canvas.width
      y = Math.random() < 0.5 ? 0 - radius : canvas.height + radius 
    }
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`
    const angle = Math.atan2(canvas.height/2 -y, canvas.width /2 - x)
    const velocity = { 
    x: Math.cos(angle),
    y: Math.sin(angle)
  } 
    enemies.push(new Enemy(x, y, radius, color, velocity))
  }, 1000
  )
}

function animate() {
  animationId = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.update();
 
  for (let index = particles.length - 1; index >= 0; index--) {
    const particle = particles[index]
    if(particle.alpha <= 0) {
      particles.splice(index, 1)
    } else {
      particle.update()
    }
    

  }
  for (let index = projectiles.length - 1; index >= 0; index--) {
    const projectile = projectiles[index]
    projectile.update()
    
    if (projectile.x + projectile.radius < 0 || 
        projectile.x - projectile.radius > canvas.width ||
        projectile.y + projectile.radius < 0 ||
        projectile.y - projectile.radius > canvas.height) {
        projectiles.splice(index, 1)
      }
  }

  for (let index = enemies.length - 1; index >= 0; index--) {
    const enemy = enemies[index]
  
  enemy.update()

  const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
  
  if (dist - enemy.radius - player.radius < 1) {
    cancelAnimationFrame(animationId)
    clearInterval(intervalId)

    modalEl.style.display = 'block'
    gsap.fromTo('#modalEl', {
      scale: 0.8, opacity: 0},
      {scale: 1, opacity: 1, ease: 'expo'
    })
      frontscore.innerHTML = score
  }

  for (let projectileIndex = projectiles.length - 1; projectileIndex >= 0; projectileIndex--) {
      
    const projectile = projectiles[projectileIndex]
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)

      if (dist - enemy.radius - projectile.radius < 1) {

        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(new Particle(projectile.x,
            projectile.y,
            Math.random() * 2, enemy.color,
            {x: (Math.random() - 0.5) * Math.random() * 6, y: (Math.random() - 0.5) * Math.random() * 6}))
        }

        if (enemy.radius - 10 > 5) {

          gsap.to(enemy, {
            radius: enemy.radius - 10
          })
            projectiles.splice(projectileIndex, 1)
            score = score + 100
            scoreEl.innerHTML = score
       
        } else {
            enemies.splice(index, 1)
            score = score + 150
            scoreEl.innerHTML = score
            projectiles.splice(projectileIndex, 1)

        }
      }
  }
}

}

startButton.addEventListener('click', () => {
  init()
  animate()
  spawnEnemies()
  score = 0;
  gsap.to('#startEl', {
    opacity: 0,
    scale: 0.8,
    duration: 0.3,
    ease: "expo.in",
    onComplete: () => {
      startEl.style.display = 'none';
    }
  })
})


addEventListener('click', (event) => {
  const angle = Math.atan2(event.clientY - player.y, event.clientX - player.x)
  const velocity = {
    x: Math.cos(angle) * 5,
    y: Math.sin(angle) * 5
  } 
  projectiles.push(new Projectile(player.x, player.y, 5, 'white', velocity ))
})

buttonEl.addEventListener('click', () => {
  init()
  animate()
  spawnEnemies()
  scoreEl.innerHTML = score

  gsap.to('#modalEl', {
    opacity: 0,
    scale: 0.8,
    duration: 0.3,
    ease: "expo.in",
    onComplete: () => {
      modalEl.style.display = 'none';
    }
  })
})

window.addEventListener('keydown', (event) => {
  console.log(event.key)
  switch (event.key) {
    case "d":
      player.velocity.x += 1
      break
    case "w":
      player.velocity.y -= 1 
      break
    case "a":
      player.velocity.x -= 1  
      break
    case "s":
    player.velocity.y += 1
    break
  }
})