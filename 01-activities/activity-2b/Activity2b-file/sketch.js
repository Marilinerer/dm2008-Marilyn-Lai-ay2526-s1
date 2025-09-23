// DDM2008 — Activity 2b
// (Pattern Making, 40 min)

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(255);
  let p = 0;
  noStroke();

  for (let i = -47; i < 450; i += 50) {
    for (let j = -5; j < 450; j += 75) {
      fill(7, 87, 152);
      ellipse(i + 25, j + 10, 40, 60);

      fill(72, 120, 170);
      ellipse(i + 5 + p, j + 30, 40, 60);

      fill(121, 152, 196);
      ellipse(i + 20, j + 45, 40, 60);

      fill(185, 202, 222);
      ellipse(i + 5 + p, j + 70, 40, 60);

      if (keyIsPressed == true) {
        if (key == "1") {
          p = 5;
        } else if (key == "2") {
          p = 10;
        } else if (key == "3") {
          p = 15;
        } else if (key == "4") {
          p = 20;
        }
      }
    }
  }
}
