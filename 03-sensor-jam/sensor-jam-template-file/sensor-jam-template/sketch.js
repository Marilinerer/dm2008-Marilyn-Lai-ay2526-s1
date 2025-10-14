let port; // Serial Communication port
let connectBtn;
let colors = ["#073763", "#0b5394", "#3d85c6","#6faadc","#9fc5ea","#cfe2f3", "#b4a7d6", "#8e7cc3", "#674ea7", "#351c75","#201240"];

let sensorVal, circleSize, colorVal;

function setup() {
  createCanvas(windowWidth, windowHeight);
  port = createSerial(); // creates the Serial Port

  // Connection helpers
  connectBtn = createButton("Connect to Arduino");
  connectBtn.position(20, 20);
  connectBtn.mousePressed(connectBtnClick);

  circleSize = 100;
  colorVal = 0;

}

function draw() {
  background(100);
  noStroke();
  fill(colors[colorVal]);
  ellipse(width / 2, height / 2, circleSize);

  // Receive data from Arduino
  if (port.opened()) {
    sensorVal = port.readUntil("\n");
    // Only log data that has information, not empty signals
    if (sensorVal[0]) {
      console.log(sensorVal);
      // Update circle's size with sensor's data
      // Reduce delay() value in Ardiuno to get smoother changes
      
      circleSize = map(sensorVal, 2, 130, 40, 200);
      colorVal = map(sensorVal, 2, 130, 0, colors.length - 1)
      colorVal = constrain(floor(map(sensorVal, 2, 130, 0, colors.length -1)), 0, colors.length - 1);
      //circleSize = sensorVal;
    }
  }
}

// DO NOT REMOVE THIS FUNCTION
function connectBtnClick(e) {
  // If port is not already open, open on click,
  // otherwise close the port
  if (!port.opened()) {
    port.open(9600); // opens port with Baud Rate of 9600
    e.target.innerHTML = "Disconnect Arduino";
    e.target.classList.add("connected");
  } else {
    port.close();
    e.target.innerHTML = "Connect to Arduino";
    e.target.classList.remove("connected");
  }
}
