let strokeColor;
let s = 100;

function setup() {
  createCanvas(400, 400);
  strokeColor = color(100);
  rectMode(CENTER);
}

function draw() {
  //   line to split canvas

  stroke(strokeColor);
  line(200, 0, 200, 400);
  line(0, 200, 400, 200);
  s = random(49, 120);
}

function keyPressed() {
  switch (key) {
    case "1":
      background(220);
      noStroke();
      fill(255, 0, 0);
      ellipse(100, 100, s);
      strokeColor = color(255, 0, 0);
      break;

    case "2":
      background(220);
      noStroke();
      fill(0, 255, 0);
      rect(300, 100, s);
      strokeColor = color(0, 255, 0);
      break;

    case "3":
      background(220);
      noStroke();
      fill(0, 0, 255);
      rect(100, 300, s);
      strokeColor = color(0, 0, 255);
      break;

    case "4":
      background(220);
      noStroke();
      fill(0, 0, 0);
      ellipse(300, 300, s);
      strokeColor = color(0, 0, 0);
      break;
      
      case "p":
      saveCanvas("activity1b-image", "jpg");
      break;
  }
}

