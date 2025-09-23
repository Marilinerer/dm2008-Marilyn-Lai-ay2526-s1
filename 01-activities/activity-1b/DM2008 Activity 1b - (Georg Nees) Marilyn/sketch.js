// DM2008
// Activity 1b (Georg Nees)

let x;
let y;
let w;

function setup() {
  createCanvas(800, 800, WEBGL);
  background(240);
}

function draw() {
  x = random(-width, width);
  y = random(-height, height);
  z = random([6, 7, 8]);
  w = random(10, 80);
  r = random(-181, 180);

  // background(240,40);

  stroke(0);
  strokeWeight(random(0.2, 1));
  noFill();
  rotateY(r);
  ellipse(x, y, w, w, z);
}

function keyPressed() {
  saveCanvas("activity1b-image", "jpg");
}
