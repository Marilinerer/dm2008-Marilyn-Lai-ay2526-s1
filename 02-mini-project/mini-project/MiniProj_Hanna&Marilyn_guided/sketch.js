// DM2008 — Mini Project
// PONG (Starter Scaffold)

// Notes for students:
// 1) Add paddle controls (W/S and ↑/↓) inside handleInput()
// 2) Add scoring + reset when the ball goes past a paddle
// 3) Add win conditions / start + game-over states if you want

/* ----------------- Globals ----------------- */
let leftPaddle, rightPaddle, ball, scoreLeft, scoreRight;
let gameState = "start"; // new global: start, play, gameOver
let winningScore = 5;
let winner = "";
let scoreCheck = 1;
let music, bounce, menu, score, yay;

/* ----------------- Media Loading ----------------- */
function preload() {
  music = loadSound("Assets/random-race.mp3");
  bounce = loadSound("Assets/bounceSfx.mp3");
  score = loadSound("Assets/scoreSfx.mp3");
  menu = loadSound("Assets/menuSfx.mp3");
  yay = loadSound("Assets/cheeringSfx.mp3");
}

/* ----------------- Setup & Draw ----------------- */
function setup() {
  createCanvas(640, 360);
  noStroke();

  // paddles: x, y, w, h
  leftPaddle = new Paddle(30, height / 2 - 30, 10, 60);
  rightPaddle = new Paddle(width - 40, height / 2 - 30, 10, 60);

  // ball starts center with a gentle push
  ball = new Ball(width / 2, height / 2, 8);
  scoreLeft = 0;
  scoreRight = 0;

}

function draw() {
  background(18);

  // 1) read input (students: add paddle movement here)
  if (gameState === "start") {
    showStartScreen();
  } else if (gameState === "play") {
    handleInput();

    // 2) update world
    leftPaddle.update();
    rightPaddle.update();
    ball.update();

    // 3) handle collisions
    ball.checkWallBounce(); // top/bottom
    ball.checkPaddleBounce(leftPaddle);
    ball.checkPaddleBounce(rightPaddle);

    // 4) draw everything
    drawCourt();
    leftPaddle.show();
    rightPaddle.show();
    ball.show();
    drawScores();

    // 5) check win condition
    if (scoreLeft >= winningScore) {
      winner = "Left Player Wins!";
      gameState = "gameOver";
      yay.play();
    } else if (scoreRight >= winningScore) {
      winner = "Right Player Wins!";
      gameState = "gameOver";
      yay.play();
    }
  } else if (gameState === "gameOver") {
    showGameOverScreen();
    music.stop();
    scoreCheck = 1;
  }
}

function showStartScreen() {
  fill(255);
  textSize(28);
  textAlign(CENTER, CENTER);
  text("PONG\nPress ENTER to Start", width / 2, height / 2);
}

function showGameOverScreen() {
  fill(255);
  textSize(28);
  textAlign(CENTER, CENTER);
  text(`${winner}\nPress ENTER to Restart`, width / 2, height / 2);
}

function keyPressed() {
  if (gameState === "start" && keyCode === ENTER) {
    gameState = "play";
    menu.play();
    resetGame();
  } else if (gameState === "gameOver" && keyCode === ENTER) {
    gameState = "start";
    menu.play();
    scoreLeft = 0;
    scoreRight = 0;
  }
}

function resetGame() {
  ball.reset();
  leftPaddle.pos.y = height / 2 - leftPaddle.h / 2;
  rightPaddle.pos.y = height / 2 - rightPaddle.h / 2;
  music.play();
  scoreCheck = 1;
}

function drawScores() {
  fill(255);
  textSize(32);
  textAlign(CENTER, TOP);
  text(scoreLeft, width / 4, 20);
  text(scoreRight, (width / 4) * 3, 20);
}

/* ----------------- Input ----------------- */
function handleInput() {
  // TODO (students): move paddles
  // Example targets:
  // - W/S to move leftPaddle up/down
  // - UP/DOWN to move rightPaddle up/down
  //
  // Hints:
  // leftPaddle.vy = -5 or 5; rightPaddle.vy = -5 or 5;
  // Make sure to stop paddles when keys are released (see keyReleased)

  if (keyIsPressed) {
    if (key === "w" || key === "W") {
      leftPaddle.vy = -5;
    }
    if (key === "s" || key === "S") {
      leftPaddle.vy = 5;
    }

    if (keyCode == 38) {
      rightPaddle.vy = -5;
    }
    if (keyCode == 40) {
      rightPaddle.vy = 5;
    }
  }
}

function keyReleased() {
  // Stop paddles when keys are released (students: fill this once handleInput is added)
  leftPaddle.vy = 0;
  rightPaddle.vy = 0;
}

/* ----------------- Classes ----------------- */
class Paddle {
  constructor(x, y, w, h) {
    this.pos = createVector(x, y);
    this.w = w;
    this.h = h;
    this.vy = 0; // students will change this via input
    this.speed = 5;
  }

  update() {
    // basic vertical movement; constrained to canvas
    this.pos.y += this.vy;
    this.pos.y = constrain(this.pos.y, 0, height - this.h);
  }

  show() {
    fill(220);
    rect(this.pos.x, this.pos.y, this.w, this.h, 2);
  }
}

class Ball {
  constructor(x, y, r) {
    this.pos = createVector(x, y);
    this.r = r;
    // gentle random direction
    this.vel = createVector(0, 0);
    this.vel.x = random([-1, 1]) * 3.5;
    this.vel.y = random([-1, 1]) * 2.0;
  }

  update() {
    this.pos.add(this.vel);
    if (this.pos.x < 0) {
      //right player +1 score
      scoreRight++;
      scoreCheck += 0.25;
      score.play();
      text(scoreRight.toString(), 480, 50); //get it to stayy
      ball.reset();
    }

    if (this.pos.x > width) {
      //left player +1 score
      scoreLeft++;
      scoreCheck += 0.25;
      score.play();
      ball.reset();
    }
  }

  checkWallBounce() {
    // bounce off top/bottom
    if (this.pos.y - this.r <= 0 || this.pos.y + this.r >= height) {
      this.vel.y *= -1;
      this.pos.y = constrain(this.pos.y, this.r, height - this.r);
      bounce.play();
    }

    // TODO (students): detect when ball passes left or right edge.
    // Increase a score counter and reset ball to center with a new direction.
    // if (this.pos.x + this.r < 0) { /* right player scores */ }
    // if (this.pos.x - this.r > width) { /* left player scores  */ }
  }

  checkPaddleBounce(p) {
    // AABB-then-circle quick check (simple & forgiving)
    const withinY = this.pos.y > p.pos.y && this.pos.y < p.pos.y + p.h;
    const withinX =
      this.pos.x + this.r > p.pos.x && this.pos.x - this.r < p.pos.x + p.w;
    

    if (withinX && withinY) {
      // push ball out so it doesn't get stuck
      if (this.vel.x < 0) {
        this.pos.x = p.pos.x + p.w + this.r;
      } else {
        this.pos.x = p.pos.x - this.r;
      }
      this.vel.x *= -1; // reflect horizontally
    }
  }

  show() {
    fill(255, 170, 70);
    circle(this.pos.x, this.pos.y, this.r * 2);
  }

  reset() {
    // students: call this after a point is scored

    this.pos.set(width / 2, height / 2);
    this.vel.set(
      random([-1, 1]) * 2.5 * scoreCheck,
      random([-1, 1]) * 2 * scoreCheck
    );
  }
}

/* ----------------- UI helpers ----------------- */
function drawCourt() {
  // center line
  stroke(80);
  strokeWeight(2);
  for (let y = 10; y < height; y += 18) {
    line(width / 2, y, width / 2, y + 8);
  }
  noStroke();
}
