let port; // Serial Communication port
let connectBtn;

let agents = [];
const NUM_START = 40;

let isReturning = false;
let isCharging = false;
let pushOrigin;
let ripple = { active: false, radius: 0, alpha: 0 };
let pressure = 0; // 0–1 strength
let chargeStart = 0;
let smoothedPressure = 0;
const smoothing = 0.1;
let sensorVal;

let isSquishing = false;
let squishAxis = "vertical"; // current stored axis; toggles each R press
let squishStart = 0; // millis() when R started being held
let squishAmount = 0; // 0..1 computed each draw while holding
const SQUISH_RAMP_MS = 800;
let doSquishBounce = false;
let squishBounceStart = 0;
const SQUISH_BOUNCE_MS = 100; // how long the overshoot lasts before returning to 1
const SQUISH_OVERSHOOT = 1.3; // overshoot multiplier (12% bigger)
let bounceState = "idle"; // 'idle' | 'waiting' | 'overshoot'
const OVERSHOOT_MS = 140; // length of quick overshoot
const WAIT_THRESHOLD = 0.04; // how close to 1 to consider "returned"
const WAIT_FRACTION = 0.9;   // trigger when 50% of agents are close (was 0.6)
const WAIT_TIMEOUT = 260; // ms fallback max wait before forcing overshoot
let SPRING_K = 0.34;   // was 0.18 — higher = faster return
let SPRING_DAMPING = 0.78; // was 0.85 — lower = snappier

let SENSOR_MIN = 0.0;   // observed idle baseline 
let SENSOR_MAX = 0.2;  // observed max when pressed (adjust after testing) 
const SENSOR_GAIN = 1.0; 
// use >1.0 to amplify if needed 
const SENSOR_ACTIVE_THRESH = 0.008; 
const SENSOR_RELEASE_THRESH = 0.005;


// === SOUND ===
let bgm; // background music
let sfxDroplet; // interaction sfx
let boing;

function preload() {
  bgm = loadSound("assets/BGM_meditativering.mp3");
  sfxDroplet = loadSound("assets/SFX_droplet.mp3");
  boing = loadSound("assets/nutplop2.mp3")
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  port = createSerial(); // creates the Serial Port

  // Connection helpers
  connectBtn = createButton("Connect to Arduino");
  connectBtn.position(20, 20);
  connectBtn.mousePressed(connectBtnClick);

  colorMode(HSB, 360, 255, 255, 255);
  noStroke();
  initAgents();

  // === Start background music ===
  if (bgm && !bgm.isPlaying()) {
    bgm.loop();
    bgm.setVolume(0.5); // adjust to taste
  }
}

function initAgents() {
  agents = [];
  for (let i = 0; i < NUM_START; i++) {
    const x = random(width);
    const y = random(height);
    const sz = random(60, 150); //size range
    agents.push(new Agent(x, y, sz));
  }
}

class Agent {
  constructor(x, y, sz) {
    this.x = x;
    this.y = y;
    this.sz = sz;

    const a = random(TWO_PI);
    const s = random(0.3, 1.2);
    this.dx = cos(a) * s;
    this.dy = sin(a) * s;

    this.hue = random(360);
    this.alpha = 200;

    this.scaleX = 1;
    this.scaleY = 1;
    this.targetScaleX = 1;
    this.targetScaleY = 1;
  }

  update() {
  this.x += this.dx;
  this.y += this.dy;

  // --- idle drifting ---
  if (!isCharging && !isReturning) {
    this.dx += random(-0.05, 0.05);
    this.dy += random(-0.05, 0.05);
    this.dx = constrain(this.dx, -1.5, 1.5);
    this.dy = constrain(this.dy, -1.5, 1.5);
    const r = this.sz / 2;
    if (this.x < r)       { this.x = r; this.dx = abs(this.dx); }
    if (this.x > width-r) { this.x = width - r; this.dx = -abs(this.dx); }
    if (this.y < r)       { this.y = r; this.dy = abs(this.dy); }
    if (this.y > height-r){ this.y = height - r; this.dy = -abs(this.dy); }
  }

  // --- return phase ---
  if (isReturning) {
    const cx = width / 2, cy = height / 2;
    let vx = cx - this.x, vy = cy - this.y;
    const mag = sqrt(vx*vx + vy*vy) || 1;
    vx /= mag; vy /= mag;
    this.dx += vx * 0.08;// return speed
    this.dy += vy * 0.08;// return speed
    this.dx *= 0.97;
    this.dy *= 0.97;
  }

  // --- soft outer boundary ---
  // If bubble drifts too far (beyond 1.5× canvas), gently pull it back
  const marginX = width * 0.05;  // 1.5× total span, further or nearer limit
  const marginY = height * 0.05; // this must be same as above
  if (this.x < -marginX || this.x > width + marginX ||
      this.y < -marginY || this.y > height + marginY) {
    const cx = width / 2;
    const cy = height / 2;
    const dirX = cx - this.x;
    const dirY = cy - this.y;
    const dist = sqrt(dirX * dirX + dirY * dirY) || 1;
    const pull = 0.1; // strength of soft boundary pull, stronger = faster return
    this.dx += (dirX / dist) * pull;
    this.dy += (dirY / dist) * pull;
  }

   // --- animate scales toward target scales (smooth transition) ---
    const k = SPRING_K; // spring stiffness (how fast it moves toward target)
    const damping = SPRING_DAMPING; // damping factor for scale velocity

    // keep per-agent scale velocity (add these in constructor)
    this.scaleVelX = 0;
    this.scaleVelY = 0;

    // in update() replace the earlier lerp code with:
    const desiredX = this.targetScaleX;
    const desiredY = this.targetScaleY;

    // spring integration for X
    let forceX = (desiredX - this.scaleX) * k;
    this.scaleVelX = (this.scaleVelX + forceX) * damping;
    this.scaleX += this.scaleVelX;

    // spring integration for Y
    let forceY = (desiredY - this.scaleY) * k;
    this.scaleVelY = (this.scaleVelY + forceY) * damping;
    this.scaleY += this.scaleVelY;
}

  show() {
    noStroke();
    fill(this.hue, 180, 255, this.alpha);
    const w = this.sz * this.scaleX;
    const h = this.sz * this.scaleY;
    ellipse(this.x, this.y, w, h);
  }

  isInside() {
    const r = this.sz / 2;
    return (
      this.x >= r && this.x <= width - r &&
      this.y >= r && this.y <= height - r
    );
  }

  resetIdle() {
    const a = random(TWO_PI);
    const s = random(0.3, 1.2);
    this.dx = cos(a) * s;
    this.dy = sin(a) * s;
  }

  // continuous outward push (applied while key is held)
  applyOutwardForce(cx, cy, strength) {
    const dx = this.x - cx;
    const dy = this.y - cy;
    const mag = sqrt(dx*dx + dy*dy) || 1;
    const nx = dx / mag;
    const ny = dy / mag;

    // smaller impulse each frame
    const force = map(strength, 0, 1, 0.2, 1.2);
    this.dx += nx * force;
    this.dy += ny * force;
  }


  setSquishTargets(axis, amount) {
    // amount: 0..1, where 1 -> maximum squash
    // we'll compress one axis and expand the other slightly to conserve area visually
    const squash = lerp(1, 0.65, amount); // compressed axis target
    const expand = lerp(1, 1.55, amount); // opposite axis target
    if (axis === "vertical") {
      this.targetScaleY = squash;
      this.targetScaleX = expand;
    } else {
      this.targetScaleX = squash;
      this.targetScaleY = expand;
    }
  }
}

function draw() {
  background(0);

  // ---------- SERIAL READ + SENSOR -> SQUISH (do this first) ----------
  let rawLine = '';
  if (port && typeof port.opened === 'function' && port.opened()) {
    if (typeof port.readStringUntil === 'function') rawLine = port.readStringUntil('\n');
    else if (typeof port.readUntil === 'function') rawLine = port.readUntil('\n');
    else if (typeof port.read === 'function') rawLine = port.read();
  }

  if (rawLine && rawLine.length) {
    const parsed = parseFloat(rawLine.trim());
    if (!isNaN(parsed)) {
      // remap observed sensor span to 0..1
      let raw = constrain(parsed, SENSOR_MIN, SENSOR_MAX);
      let norm = 0;
      if (SENSOR_MAX > SENSOR_MIN) norm = (raw - SENSOR_MIN) / (SENSOR_MAX - SENSOR_MIN);
      norm = pow(norm, 0.9); // slight nonlinear curve to give low-end sensitivity
      norm = constrain(norm * SENSOR_GAIN, 0, 1);
      smoothedPressure = lerp(smoothedPressure, norm, smoothing);
      pressure = smoothedPressure;
      if (pressure > 0.002 && !pushOrigin) pushOrigin = createVector(width/2, height/2);
    }
  }

  // persistent flag for edge detection
  if (typeof window._sensorWasActive === 'undefined') window._sensorWasActive = false;
  const sensorActive = pressure > SENSOR_ACTIVE_THRESH;

  // While sensor is pressed: behave like holding R
  if (sensorActive) {
    squishAmount = constrain(map(pressure, 0, 1, 0, 1), 0, 1);
    isSquishing = true;
    if (bounceState !== 'idle') bounceState = 'idle';
    window._sensorWasActive = true;
  } else {
    // Release edge detection (hysteresis)
    if (window._sensorWasActive && pressure < SENSOR_RELEASE_THRESH) {
      // sensor just released -> start return-to-1 then waiting -> overshoot
      isSquishing = false;
      boing.play;
      boing.setVolume(0.8);
      for (const a of agents) a.setSquishTargets(squishAxis, 0); // return to neutral
      bounceState = 'waiting';
      squishBounceStart = millis(); // start fallback timer
      doSquishBounce = false;
      window._sensorWasActive = false;
    }
    // If not active, squishAmount will decay below when we apply ramp logic
  }

  // ---------- SQUISH RAMP (keyboard fallback or decay) ----------
  // Only use the keyboard ramp if you still want it; otherwise squishAmount already set by sensor
  if (isSquishing && !sensorActive) {
    const held = millis() - squishStart;
    squishAmount = constrain(map(held, 0, SQUISH_RAMP_MS, 0, 1), 0, 1);
  } else if (!sensorActive) {
    // when not squishing and no sensor, gently decay amount toward 0
    squishAmount = lerp(squishAmount, 0, 0.12);
  }

  // ---- BOUNCING AFTER SQUISH (state machine) ----
  if (bounceState === "waiting") {
    let closeCount = 0;
    for (const a of agents) {
      if (abs(a.scaleX - 1) < WAIT_THRESHOLD && abs(a.scaleY - 1) < WAIT_THRESHOLD) {
        closeCount++;
      }
    }
    const elapsedSinceReturnStart = millis() - squishBounceStart;
    if (closeCount >= agents.length * WAIT_FRACTION || elapsedSinceReturnStart >= WAIT_TIMEOUT) {
      bounceState = "overshoot";
      for (const a of agents) {
        if (squishAxis === "vertical") {
          a.targetScaleY = 1;
          a.targetScaleX = SQUISH_OVERSHOOT;
        } else {
          a.targetScaleX = 1;
          a.targetScaleY = SQUISH_OVERSHOOT;
        }
      }
      squishBounceStart = millis();
    }
  } else if (bounceState === "overshoot") {
    if (millis() - squishBounceStart >= OVERSHOOT_MS) {
      for (const a of agents) {
        a.setSquishTargets(squishAxis, 0); // back to neutral
      }
      bounceState = "idle";
    }
  }

  // apply squish targets only when not actively overshooting
  if (bounceState === 'idle' || bounceState === 'waiting') {
    for (const a of agents) a.setSquishTargets(squishAxis, squishAmount);
  }

  if (isCharging) {
    const held = millis() - chargeStart;
    pressure = constrain(map(held, 0, 1500, 0.2, 1), 0, 1);

    // apply continuous outward force
    for (const a of agents) {
      a.applyOutwardForce(pushOrigin.x, pushOrigin.y, pressure);
    }

    // ripple visual
    ripple.active = true;
    ripple.radius = map(pressure, 0, 1, 50, 350);
    ripple.alpha = 180;
  }

  // ripple animation fade
  if (ripple.active) {
    noFill();
    stroke(180, 255, 255, ripple.alpha);
    strokeWeight(3);
    ellipse(pushOrigin.x, pushOrigin.y, ripple.radius * 2);
    ripple.radius += 10;
    ripple.alpha -= 6;
    if (ripple.alpha <= 0) ripple.active = false;
  }

  // update and draw all bubbles
  for (const a of agents) {
    a.update();
    a.show();
  }

  // once all are inside again, stop returning
  if (isReturning && agents.every(a => a.isInside())) {
    isReturning = false;
    for (const a of agents) a.resetIdle();
  }
}

function keyPressed() {
  if (key === 'f' || key === 'F') {
    isCharging = true;
    chargeStart = millis();
    pushOrigin = createVector(width / 2, height / 2);
    isReturning = false; // cancel return if in progress

    sfxDroplet.play();
    sfxDroplet.setVolume(0.6);
  }
}
function keyReleased() {
  if (key === 'f' || key === 'F') {
    isCharging = false;
    // start return when key released
    isReturning = true;
    //pressure = 0;
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