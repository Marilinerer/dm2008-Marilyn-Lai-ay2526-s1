// DM2008 – Activity 4a
// Bake a Cookie (30 min)

let cookie;

function setup() {
  createCanvas(400, 400);
  noStroke();

  // Step 3: make one cookie object
  cookie = new Cookie("chocolate", 80, width / 2, height / 2);
  cookie2 = new Cookie("matcha", 90, 100, 100);
}

function draw() {
  background(230);

  // Step 4: call the cookie’s show() method
  cookie.show();
  cookie.move();
  cookie2.show();
  cookie2.move();
}

// Step 1: define the Cookie class
class Cookie {
  constructor(flavor, size, x, y) {
    // set up required properties
    this.flavor = flavor;
    this.size = size;
    this.x = x;
    this.y = y;
    this.color = color(196, 146, 96);
    this.color2 = color(100, 130, 80);
  }

  // Step 2: display the cookie
  show() {
    if (this.flavor == "chocolate") {
      fill(this.color);
    } else {
      fill(this.color2);
    }

    // fill(this.color);

    ellipse(this.x, this.y, this.size);

    // a few "chips" placed relative to size
    const s = this.size * 0.1;
    fill(60);
    ellipse(this.x - this.size * 0.22, this.y - this.size * 0.15, s);
    ellipse(this.x + this.size * 0.18, this.y - this.size * 0.1, s);
    ellipse(this.x - this.size * 0.05, this.y + this.size * 0.12, s);
    ellipse(this.x + this.size * 0.2, this.y + this.size * 0.18, s);
  }

  // Steps 5 & 6: Implement additional methods here

  move(direction) {
    if (direction == "right") {
      this.x += 10;
    }

    if (direction == "left") {
      this.x -= 10;
    }

    if (direction == "up") {
      this.y -= 10;
    }

    if (direction == "down") {
      this.y += 10;
    }
  }

  changeFlavour() {
    this.color = color(random(150, 180), random(100, 110), random(0, 50));
    this.color2 = color(random(90, 110), random(120, 140), random(70, 90));
  }
}

// Step 5: add movement (keyboard arrows)
function keyPressed() {
  if (keyCode == 68) {
    cookie.move("right");
    cookie2.move("left");
  }

  if (keyCode == 65) {
    cookie.move("left");
    cookie2.move("right");
  }

  if (keyCode == 87) {
    cookie.move("up");
    cookie2.move("down");
  }

  if (keyCode == 83) {
    cookie.move("down");
    cookie2.move("up");
  }
}

// Step 6: add flavor randomizer (mouse click)
function mousePressed() {
  cookie.changeFlavour();
  cookie2.changeFlavour();
}
