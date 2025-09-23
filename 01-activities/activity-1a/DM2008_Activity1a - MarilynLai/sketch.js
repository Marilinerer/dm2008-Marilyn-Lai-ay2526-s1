// DDM2008
// Activity 1a

// Run the sketch, then click on the preview to enable keyboard
// Use the 'Option' ('Alt' on Windows) key to view or hide the grid
// Use the 'Shift' key to change overlays between black & white
// Write the code for your creature in the space provided

let w = 20 
function setup() {
  createCanvas(400, 400);
}

function draw() {
   background('#b6e2ff');
  rect(150,150,150, 60)
  fill('#063068')
  stroke('#063068')
  rect(200,150, 50)
  rect(250,150,50)
  triangle(128,100,135,75,135,100)
  triangle(178,100,185,75,185,100)
  rect(280,200, 20,45)
  rect(250,200, 20,40)
  rect(200,200, 20,45)
  rect(170,200, 20,40)
  rect(120,100, 80)
  stroke('#b6e2ff')
  strokeWeight(2)
  line(120,180, 200,180)
  line(200,180, 200,100)
  line(140,150, 160,165)
  line(160,165, 180,150)
  line(138, 115, 148,120)
  line(178,115, 168, 120)
  ellipse(145, 130, 2,5)
  ellipse(170, 130,2,5)
  stroke('#063068')
  line(300,160,310,155)
  line(310,155, 330,165)
  line(330,165, 320,180)
  line(320,180, 330,200)
  line(330,200, 320,210)
  triangle(316,208,323,214,312,218)
  

  
  helperGrid(); // do not edit or remove this line
}
