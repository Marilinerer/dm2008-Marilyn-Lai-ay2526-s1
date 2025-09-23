// DM2008 — Activity 3b
// (Painting App, 50 min)

// 1) Palette + size
const palette = ["#0F52BA", "#3c78d8", "#A7C7E7", "#eeeeee"];
let colorIndex = 0;
let sizeVal = 20;

// 2) Brush registry (array of functions)
const brushes = [brushCircle, brushSquare, brushStreak];
let currentBrush = 0; // 0, 1, or 2

function setup() {
  createCanvas(600, 600);
  background(240);
  rectMode(CENTER);
}

function draw() {
  // paint only while mouse is held
  if (mouseIsPressed) {
    const col = palette[colorIndex];
    // call the selected brush function
    brushes[currentBrush](mouseX, mouseY, col, sizeVal);
  }
}

// 3) Brush functions (students can customize/extend)
function brushCircle(x, y, c, s) {
  noStroke();
  fill(c);
  ellipse(x, y, s);
}

function brushSquare(x, y, c, s) {
  push();
  translate(x, y);
  noStroke();
  fill(c);
  rect(0, 0, s, s);
  pop();
}

function brushStreak(x, y, c, s) {
  stroke(c);
  strokeWeight(max(2, s / 8));
  point(x, y);
}

// 4) Brush UI: select brush, cycle color, change size, clear
function keyPressed() {
  switch (key) {
    case "1":
      currentBrush = 0; // circle
      console.log("Pressed 1 -> circle brush")
      break;
    case "2":
      currentBrush = 1; // square
      console.log("Pressed 2 -> square brush")
      break;
    case "3":
      currentBrush = 2; // streak
      console.log("Pressed 3 -> streak brush")
      break;
  }
  if (key == "C" || key == "c") {
    colorIndex = (colorIndex + 1) % palette.length; // cycle color
    console.log("color is now: " + colorIndex);
  }
  if (key == "+" || key == "=") {
    sizeVal += 4;
  }
  if (key == "-" || key == "_") {
    sizeVal = max(4, sizeVal - 4);
  }
  if (key == "X" || key == "x") {
    background(240); // clear canvas
  }
  if (key == "E" || key == "e") {
    colorIndex = 3;
    console.log("eraser mode")
  }

  // TODO: add an 'E' (eraser) mode by painting with background color
  // e.g., if eraserMode, use color(240) instead of palette[colorIndex]
}
