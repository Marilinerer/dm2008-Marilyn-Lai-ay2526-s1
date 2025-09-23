// DM2008 — Activity 3a
// (Array Sampler, 25 min)

// 1. Create an array of colors (or other values)
//    You can make more than one array if you'd like
let palette = ["#151b54", "#737ca1", "#1e90ff", "#82caff"];

// 2. A variable to track the current index
let nextIndex = palette.length - 1;
let s = 0;

function setup() {
  createCanvas(400, 400);
  strokeWeight(3);
}

function draw() {
  if (palette.length <= 1) {
    background(0)
  }
  
  else if (palette.length > 1){
      background(palette[s]);
  }
  
  // 3. Use the array value at currentIndex
  const spacing = width / (palette.length + 1);
  for (let i = 0; i < palette.length; i++) {
    fill(palette[i]); // use the i-th color
    stroke(palette[s]);

    const x = (i + 1) * spacing; // position from the loop index
    ellipse(x, height / 2, 60);
  }
}

function mousePressed() {
  if (palette.length > 1) {
    s = floor(random(0, palette.length ));
    console.log("Stroke index:", s, "→", palette[s]);
    // console.log(palette.length)
  }
}

function keyPressed() {
  if (key == "a" || key == "A") {
    // Add a new random color to the end
    palette.push(color(random(20, 50), random(0, 30), random(100, 255)));
  }
  if (key == "r" || key == "R") {
    // Remove the last color (if any)
    if (palette.length > 0) {
      palette.splice(palette.length - 1, 1);
    }
    // to call the randomise again, after the array gets spliced
    s = floor(random(0, palette.length ));
  }
  console.log(palette);
}

// Log in the console to check

/* 
TODOs for students:
1. Replace colors with your own data (positions, text, sizes, etc).
2. Try mousePressed() instead of keyPressed().
3. Use push() to add new items, or splice() to remove them, then check how the sketch adapts.
4. Try looping through an array to visualize all the items within it instead of accessing one item at a time.
*/
