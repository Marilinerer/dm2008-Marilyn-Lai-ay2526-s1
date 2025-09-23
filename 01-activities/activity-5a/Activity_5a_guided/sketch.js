let balls = [];

function setup() {
  createCanvas(400, 400);
  // make 2 balls to start
 
  for (let b = 0; b <5; b++){
    balls.push(new Ball(20+ b*90, 200));
  }
}

function draw() {
  background(230);

  // update & display each ball
  for (let i = 0; i < balls.length; i++) {
    balls[i].move();
    balls[i].show();
    // check collision with others
    balls[i].checkCollision(balls);
  }
}

class Ball {
  constructor(x, y) {
    this.r = random(30, 40);
    this.pos = createVector(x, y);
    this.vel = createVector(random(-2, 2), random(-2, 2)); //find the exercise where it was -1, 1 *something
  }

  move() {
    this.pos.add(this.vel);
    // wrap around edges
    // if (this.pos.x < -this.r) {this.vel.x = this.vel.x *-1;}
    // if (this.pos.x > width + this.r) {this.vel.x = this.vel.x *-1;}
    // if (this.pos.y < -this.r) {this.vel.y = this.vel.y *-1}
    // if (this.pos.y > height + this.r) {this.vel.y = this.vel.y *-1;}
    
    if(this.pos.x < 0 || this.pos.x > width){this.vel.x *= -1}
    if(this.pos.y < 0 || this.pos.y > height){this.vel.y *= -1}
  }

  show() {
    fill(100, 180, 220);
    noStroke();
    ellipse(this.pos.x, this.pos.y, this.r * 2);
  }

  checkCollision(others) {
    for (let i = 0; i < others.length; i++) {
      // Make sure we do not compare the ball to itself
      if (others[i] !== this) {
        let other = others[i];
        let d = dist(this.pos.x, this.pos.y, other.pos.x, other.pos.y);
        if (d < this.r + other.r) {
          push();
          stroke(200, 60, 60);
          strokeWeight(2);
          noFill();
          ellipse(this.pos.x, this.pos.y, this.r * 2); // highlight on collision
          pop();
          
          this.vel.x*=-1
          this.vel.y*=-1
        }
      }
    }
  }
}