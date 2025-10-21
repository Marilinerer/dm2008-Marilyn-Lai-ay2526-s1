let colorBtn,
  opacitySlider,
  sizeSlider,
  shapeSelect,
  outline,
  outlineSize,
  outlineLabel;
let shapeColor;
let grow, down, prevSize;
let lastPlayed = "";

function preload() {
  grow = loadSound("Music/grow.mp3");
  down = loadSound("Music/down.mp3");
}

function setup() {
  createCanvas(640, 400);
  noStroke();
  textFont("Helvetica, Arial, sans-serif");

  // starting color
  shapeColor = color(random(255), random(255), random(255));

  // Button: change color
  colorBtn = createButton("Change Color");
  colorBtn.position(16, 16);
  colorBtn.mousePressed(randomShapeColor);

  function randomShapeColor() {
    shapeColor = color(random(255), random(255), random(255));
  }

  // Opacity Slider
  createP("Opacity").position(0, 50).style("margin", "4px 0 0 16px");
  opacitySlider = createSlider(0, 255, 255, 1);
  opacitySlider.position(15, 70);

  // Slider: controls size
  createP("Size").position(0, 100).style("margin", "4px 0 0 16px");
  sizeSlider = createSlider(20, 220, 100, 1);
  sizeSlider.position(15, 130);
  prevSize = sizeSlider.value();

  // Dropdown: choose shape
  createP("Shape").position(0, 150).style("margin", "8px 0 0 16px");
  shapeSelect = createSelect();
  shapeSelect.position(16, 190);
  shapeSelect.option("ellipse");
  shapeSelect.option("rect");
  shapeSelect.option("triangle");

  // Outline checkbox + outline size slider
  outline = createCheckbox("Outline", false);
  outline.position(0, 220).style("margin", "8px 0 0 16px");

  outlineLabel = createP("Outline Weight")
    .position(20, 250)
    .style("margin", "5px 0 0 16px");
  outlineSize = createSlider(1, 40, 1, 1);
  outlineSize.position(35, 280);

  outlineLabel.hide();
  outlineSize.hide();
}

function draw() {
  background(240);

  push();
  translate(width * 0.65, height * 0.5);

  let s = sizeSlider.value();

    if (s > prevSize && grow.isLoaded() && lastPlayed !== "grow") {
      grow.play();
      lastPlayed = "grow";
    } else if (s < prevSize && down.isLoaded() && lastPlayed !== "down"){
      down.play();
      lastPlayed = "down";
    }
    prevSize = s;

  let o = opacitySlider.value();

  if (outline.checked()) {
    outlineLabel.show();
    outlineSize.show();
    stroke(0);
    strokeWeight(outlineSize.value());
  } else {
    noStroke();
    outlineLabel.hide();
    outlineSize.hide();
  }

  fill(red(shapeColor), green(shapeColor), blue(shapeColor), o);

  // draw chosen shape
  let choice = shapeSelect.value();
  if (choice === "ellipse") {
    ellipse(0, 0, s, s);
  } else if (choice === "rect") {
    rectMode(CENTER);
    rect(0, 0, s, s);
  } else if (choice === "triangle") {
    triangle(-s * 0.6, s * 0.5, 0, -s * 0.6, s * 0.6, s * 0.5);
  }
  pop();
}
