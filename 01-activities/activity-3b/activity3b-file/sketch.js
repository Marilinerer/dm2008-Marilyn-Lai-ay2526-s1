// DM2008 — Activity 3b
// (One Function Wonder, 15 min)

function setup() {
  createCanvas(400, 400);
  rectMode(CENTER);
  angleMode(DEGREES);
}

function shapeUp(x, y, size, color) {
  fill(color);

  rect(x, y, size);
}

function draw() {
  background(220);
  noStroke();

  // TODO 1:
  // Define a function that draws something (a shape or group of shapes).
  // It should take at least one parameter (e.g., position, size, or color).
  // shapeUp(90, 80, 200, 100, 45);
  // shapeUp(150, 100, 90);

  for (i = 0; i < 20; i++) {
    for (j = 0; j < 12; j++) {
      shapeUp(i * 40, j * 40, 35 + i * -2, 50 + i * 15);
    }
  }
}
// TODO 2:
// Call your function multiple times with different parameter values.
// myShape(100, 200, 50);
// myShape(300, 200, 80);

// TODO 3:
// (Challenge) Call your function inside a for loop
// to create a repeating pattern or variation.

// Example starter function:
// function myShape(x, y, s) {
//   ellipse(x, y, s, s);
// }
