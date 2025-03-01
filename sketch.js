// Game state variables
let gameState = 'start'; // start, playing, gameOver
let score = 0;
let health = 100;
let ammo = 30;
let maxAmmo = 30;
let reloading = false;
let reloadStartTime = 0;
let reloadDuration = 500; // Changed from 1000 to 500 (0.5 seconds to reload)

// Environment variables
let zombies = [];
let bullets = [];
let spawnPoints = [];
let lastSpawnTime = 0;
let spawnInterval = 1500; // Initial spawn interval
let difficultyTimer = 0;
let difficultyInterval = 20000; // Changed from 10000 to 20000 (increase difficulty every 20 seconds instead of 10)
let deathEffects = []; // Array to store death effect particles

// Assets
let zombieImg;
let bulletImg;
let gunSound;
let zombieDeathSound;
let reloadSound;
let backgroundMusic;
let emptyGunSound;

function preload() {
  // Load images and sounds here
  // These would be replaced with actual assets
  // zombieImg = loadImage('assets/zombie.png');
  // bulletImg = loadImage('assets/bullet.png');
  // gunSound = loadSound('assets/gunshot.mp3');
  // zombieDeathSound = loadSound('assets/zombie_death.mp3');
  // reloadSound = loadSound('assets/reload.mp3');
  // backgroundMusic = loadSound('assets/background.mp3');
  // emptyGunSound = loadSound('assets/empty_gun.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  noCursor();
  
  // Define spawn points (x, y, width, height, type)
  spawnPoints = [
    { x: width * 0.2, y: height * 0.3, w: 100, h: 150, type: 'window' },
    { x: width * 0.8, y: height * 0.35, w: 90, h: 130, type: 'window' },
    { x: width * 0.5, y: height * 0.3, w: 120, h: 180, type: 'door' }
  ];
}

function draw() {
  // Always draw the game scene first
  drawGameScene();
  
  // Then overlay the appropriate UI based on game state
  switch (gameState) {
    case 'start':
      drawStartWindow();
      break;
    case 'playing':
      // Just show the HUD during gameplay
      drawHUD();
      drawCrosshair();
      break;
    case 'gameOver':
      drawGameOverScreen();
      break;
  }
}

function drawGameScene() {
  // Use clear() instead of background to make the canvas transparent
  clear();
  
  // Update and display zombies if game is in progress
  if (gameState === 'playing') {
    updateZombies();
    
    // Update and display death effects
    updateDeathEffects();
    
    // Update and display bullets
    updateBullets();
    
    // Spawn new zombies
    if (millis() - lastSpawnTime > spawnInterval) {
      spawnZombie();
      lastSpawnTime = millis();
    }
    
    // Increase difficulty over time
    if (millis() - difficultyTimer > difficultyInterval) {
      increaseDifficulty();
      difficultyTimer = millis();
    }
    
    // Handle reloading
    if (reloading) {
      if (millis() - reloadStartTime > reloadDuration) {
        ammo = maxAmmo;
        reloading = false;
      }
    }
  }
  
  // Always draw the player
  drawPlayer();
  
  // Check game over condition
  if (gameState === 'playing' && health <= 0) {
    gameState = 'gameOver';
  }
}

function drawStartWindow() {
  // Semi-transparent overlay
  fill(0, 0, 0, 200);
  rect(0, 0, width, height);
  
  // Instruction window
  let windowWidth = width * 0.7;
  let windowHeight = height * 0.7;
  let windowX = width/2 - windowWidth/2;
  let windowY = height/2 - windowHeight/2;
  
  // Window background
  fill(40, 40, 60);
  stroke(200, 150, 50);
  strokeWeight(4);
  rect(windowX, windowY, windowWidth, windowHeight, 15);
  
  // Window title bar
  fill(60, 60, 80);
  rect(windowX, windowY, windowWidth, 50, 15, 15, 0, 0);
  
  // Title text - no stroke/outline
  noStroke();
  fill(255);
  textSize(30);
  textAlign(CENTER, CENTER);
  text("ZOMBIE SHOOTER", width/2, windowY + 25);
  
  // Instructions
  textSize(20);
  textAlign(CENTER, TOP);
  fill(255);
  let instructionsY = windowY + 80;
  let lineHeight = 30;
  
  text("DEFEND YOURSELF FROM THE ZOMBIE HORDE!", width/2, instructionsY);
  instructionsY += lineHeight * 2;
  
  text("• Click to shoot zombies", width/2, instructionsY);
  instructionsY += lineHeight;
  
  text("• Press 'R' to reload your weapon", width/2, instructionsY);
  instructionsY += lineHeight;
  
  text("• Zombies enter through windows and doors", width/2, instructionsY);
  instructionsY += lineHeight;
  
  text("• Don't let them reach you!", width/2, instructionsY);
  instructionsY += lineHeight * 2;
  
  // "Click anywhere to start" message - no pulsing effect
  textSize(28);
  fill(255);
  text("CLICK ANYWHERE TO START", width/2, windowY + windowHeight - 80);
  
  // Reset text alignment
  textAlign(LEFT);
}

function drawGameOverScreen() {
  background(0);
  fill(255, 0, 0);
  textSize(40);
  textAlign(CENTER, CENTER);
  text("GAME OVER", width/2, height/3);
  
  fill(255);
  textSize(30);
  text("Score: " + score, width/2, height/2);
  
  textSize(20);
  textLeading(30);
  text("RELOAD THE PAGE\nTO PLAY AGAIN", width/2, height * 0.7);
}

function drawHUD() {
  // Draw health bar
  fill(0, 0, 0, 150);
  rect(20, 20, 200, 30);
  fill(255, 0, 0);
  rect(20, 20, map(health, 0, 100, 0, 200), 30);
  
  // Health text with improved contrast - adjusted y-position
  strokeWeight(2);
  stroke(0);
  fill(255);
  textSize(16);
  textAlign(LEFT, CENTER); // Center align text vertically
  text("Health: " + health, 30, 20 + 15); // Position at center of bar
  
  // Draw ammo counter
  fill(0, 0, 0, 150);
  rect(20, 60, 200, 30);
  fill(255, 255, 0);
  rect(20, 60, map(ammo, 0, maxAmmo, 0, 200), 30);
  
  // Ammo text with improved contrast - adjusted y-position
  strokeWeight(2);
  stroke(0);
  fill(255);
  text("Ammo: " + ammo + "/" + maxAmmo, 30, 60 + 15); // Position at center of bar
  
  // Draw score
  fill(0, 0, 0, 150);
  rect(width - 150, 20, 130, 30);
  fill(255);
  textAlign(RIGHT, CENTER); // Center align text vertically
  text("Score: " + score, width - 30, 20 + 15); // Position at center of bar
  
  // Reset text alignment
  textAlign(LEFT, BASELINE);
  noStroke();
  
  // Draw reload message if reloading
  if (reloading) {
    strokeWeight(3);
    stroke(0);
    fill(255);
    textSize(24);
    textAlign(CENTER, CENTER);
    text("RELOADING...", width/2, height - 50);
    textAlign(LEFT, BASELINE);
    noStroke();
  }
  
  // Display RELOAD message when out of ammo
  if (ammo === 0 && !reloading) {
    strokeWeight(3);
    stroke(0);
    fill(255, 0, 0);
    textSize(30);
    textAlign(CENTER, CENTER);
    text("RELOAD", width/2, height - 50);
    textAlign(LEFT, BASELINE);
    noStroke();
  }
}

function drawCrosshair() {
  stroke(255);
  strokeWeight(2);
  noFill();
  
  // Draw crosshair
  line(mouseX - 15, mouseY, mouseX - 5, mouseY);
  line(mouseX + 5, mouseY, mouseX + 15, mouseY);
  line(mouseX, mouseY - 15, mouseX, mouseY - 5);
  line(mouseX, mouseY + 5, mouseX, mouseY + 15);
  
  // Draw circle
  ellipse(mouseX, mouseY, 10, 10);
}

function drawPlayer() {
  // Player position at bottom center
  let playerX = width/2;
  let playerY = height - 80;
  
  // Determine if player faces left or right based on mouse position
  let facingRight = mouseX > width/2;
  
  // Draw player body
  fill(50, 50, 150); // Blue color for player
  noStroke();
  
  // Body
  rect(playerX - 20, playerY - 30, 40, 60);
  
  // Head
  fill(200, 150, 100); // Skin tone
  ellipse(playerX, playerY - 40, 30, 30);
  
  // Arms - extended toward mouse direction
  fill(50, 50, 150);
  if (facingRight) {
    // Right arm extended
    rect(playerX + 10, playerY - 20, 30, 15);
    // Gun
    fill(70);
    rect(playerX + 30, playerY - 25, 20, 10);
  } else {
    // Left arm extended
    rect(playerX - 40, playerY - 20, 30, 15);
    // Gun
    fill(70);
    rect(playerX - 60, playerY - 25, 20, 10);
  }
  
  // Eyes looking in mouse direction
  fill(255);
  if (facingRight) {
    ellipse(playerX + 8, playerY - 40, 8, 8);
  } else {
    ellipse(playerX - 8, playerY - 40, 8, 8);
  }
}

function updateZombies() {
  for (let i = zombies.length - 1; i >= 0; i--) {
    zombies[i].update();
    zombies[i].display();
    
    // Check if zombie reached the player
    if (zombies[i].reachedPlayer()) {
      health -= zombies[i].damage;
      zombies.splice(i, 1);
    }
  }
}

function updateBullets() {
  for (let i = bullets.length - 1; i >= 0; i--) {
    bullets[i].update();
    bullets[i].display();
    
    // Check for bullet hitting zombies
    for (let j = zombies.length - 1; j >= 0; j--) {
      if (bullets[i] && bullets[i].hits(zombies[j])) {
        zombies[j].health -= bullets[i].damage;
        
        if (zombies[j].health <= 0) {
          // Zombie killed - create death effect
          createDeathEffect(zombies[j].x, zombies[j].y, zombies[j].color);
          
          // Add score and remove zombie
          score += zombies[j].points;
          zombies.splice(j, 1);
          // if (zombieDeathSound) zombieDeathSound.play();
        }
        
        // Remove bullet after hit
        bullets.splice(i, 1);
        break;
      }
    }
    
    // Remove bullets that are off-screen
    if (bullets[i] && bullets[i].isOffScreen()) {
      bullets.splice(i, 1);
    }
  }
}

function createDeathEffect(x, y, zombieColor) {
  // Create multiple particles for death effect
  for (let i = 0; i < 30; i++) {
    deathEffects.push(new DeathParticle(x, y, zombieColor));
  }
}

function updateDeathEffects() {
  for (let i = deathEffects.length - 1; i >= 0; i--) {
    deathEffects[i].update();
    deathEffects[i].display();
    
    // Remove particles that have faded out
    if (deathEffects[i].alpha <= 0) {
      deathEffects.splice(i, 1);
    }
  }
}

function spawnZombie() {
  // Choose a random spawn point
  let spawnPoint = random(spawnPoints);
  
  // Create a new zombie at the spawn point
  let x = spawnPoint.x + random(-20, 20);
  let y = spawnPoint.y + random(-20, 20);
  
  // Zombie speed increases with difficulty - more gradual curve
  let speed = map(score, 0, 1000, 1.5, 3.5); // Changed from 0-500 to 0-1000 range, max speed reduced to 3.5
  speed = constrain(speed, 1.5, 4); // Reduced max speed from 5 to 4
  
  zombies.push(new Zombie(x, y, speed));
}

function increaseDifficulty() {
  // Decrease spawn interval more gradually (more zombies)
  spawnInterval = max(500, spawnInterval - 200); // Changed from max(300, spawnInterval - 400)
  
  // Increase zombie damage over time more slowly
  Zombie.prototype.damage = min(35, Zombie.prototype.damage + 2); // Changed from +5 to +2, max reduced from 40 to 35
}

function mousePressed() {
  if (gameState === 'start') {
    // Click anywhere to start (as long as we're in the start state)
    gameState = 'playing';
    // if (backgroundMusic) backgroundMusic.loop();
    return;
  }
  
  // Shooting
  if (gameState === 'playing' && !reloading) {
    if (ammo > 0) {
      bullets.push(new Bullet(width/2, height - 50, mouseX, mouseY));
      ammo--;
      // if (gunSound) gunSound.play();
    } else {
      // Out of ammo
      // if (emptyGunSound) emptyGunSound.play();
    }
  }
}

function keyPressed() {
  // Reload when 'R' is pressed
  if (key === 'r' || key === 'R') {
    if (!reloading && ammo < maxAmmo) {
      reloading = true;
      reloadStartTime = millis();
      // if (reloadSound) reloadSound.play();
    }
  }
}

function resetGame() {
  score = 0;
  health = 100;
  ammo = maxAmmo;
  reloading = false;
  zombies = [];
  bullets = [];
  lastSpawnTime = 0;
  spawnInterval = 1500;
  difficultyTimer = millis();
}

// Zombie class
class Zombie {
  constructor(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.size = random(40, 60);
    this.health = 100;
    this.damage = 25; // Base damage (will increase over time)
    this.points = 10;
    this.color = color(random(50, 100), random(100, 150), random(50, 100)); // Greenish
  }
  
  update() {
    // Move towards the player (bottom center of screen)
    let targetX = width/2;
    let targetY = height - 50;
    
    let dx = targetX - this.x;
    let dy = targetY - this.y;
    let angle = atan2(dy, dx);
    
    this.x += cos(angle) * this.speed;
    this.y += sin(angle) * this.speed;
  }
  
  display() {
    // Draw zombie
    fill(this.color);
    noStroke();
    
    // Body
    ellipse(this.x, this.y, this.size, this.size);
    
    // Arms (static, no movement)
    rect(this.x - this.size/2 - 10, this.y, this.size/2, 10);
    rect(this.x + this.size/2 - 10, this.y, this.size/2, 10);
    
    // Eyes
    fill(255, 0, 0);
    ellipse(this.x - this.size/5, this.y - this.size/6, this.size/5, this.size/8);
    ellipse(this.x + this.size/5, this.y - this.size/6, this.size/5, this.size/8);
    
    // Health bar
    fill(0, 0, 0, 150);
    rect(this.x - this.size/2, this.y - this.size/2 - 15, this.size, 5);
    fill(255, 0, 0);
    rect(this.x - this.size/2, this.y - this.size/2 - 15, map(this.health, 0, 100, 0, this.size), 5);
  }
  
  reachedPlayer() {
    // Check if zombie reached the player area
    return this.y > height - 100;
  }
}

// Bullet class
class Bullet {
  constructor(x, y, targetX, targetY) {
    this.x = x;
    this.y = y;
    this.size = 8;
    this.speed = 15;
    this.damage = 50;
    
    // Calculate direction
    let dx = targetX - x;
    let dy = targetY - y;
    let angle = atan2(dy, dx);
    
    this.vx = cos(angle) * this.speed;
    this.vy = sin(angle) * this.speed;
  }
  
  update() {
    this.x += this.vx;
    this.y += this.vy;
  }
  
  display() {
    fill(255, 255, 0);
    noStroke();
    ellipse(this.x, this.y, this.size, this.size);
  }
  
  hits(zombie) {
    // Check if bullet hits zombie
    let d = dist(this.x, this.y, zombie.x, zombie.y);
    return d < zombie.size/2;
  }
  
  isOffScreen() {
    return (this.x < 0 || this.x > width || this.y < 0 || this.y > height);
  }
}

// Death Particle class
class DeathParticle {
  constructor(x, y, zombieColor) {
    this.x = x;
    this.y = y;
    this.size = random(5, 15);
    this.color = zombieColor;
    this.alpha = 255;
    this.fadeSpeed = random(5, 10);
    
    // Random velocity
    this.vx = random(-3, 3);
    this.vy = random(-3, 3);
    
    // Gravity
    this.gravity = 0.1;
  }
  
  update() {
    // Move particle
    this.x += this.vx;
    this.y += this.vy;
    
    // Apply gravity
    this.vy += this.gravity;
    
    // Fade out
    this.alpha -= this.fadeSpeed;
    this.alpha = constrain(this.alpha, 0, 255);
  }
  
  display() {
    // Set color with alpha
    let c = color(red(this.color), green(this.color), blue(this.color), this.alpha);
    fill(c);
    noStroke();
    
    // Draw particle
    ellipse(this.x, this.y, this.size, this.size);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
} 