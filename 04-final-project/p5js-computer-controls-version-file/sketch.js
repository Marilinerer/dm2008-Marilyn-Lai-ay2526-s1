// === HOLD TO PUSH: bubbles react instantly while F is held ===

let agents = [];
const NUM_START = 40;

let isReturning = false;
let isCharging = false;
let pushOrigin;
let ripple = { active: false, radius: 0, alpha: 0 };
let pressure = 0; // 0–1 strength
let chargeStart = 0;

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

let bgm; // background music
let sfxDroplet; // interaction sfx
let boing;

function preload() {
  bgm = loadSound("assets/BGM_meditativering.mp3");
  sfxDroplet = loadSound("assets/SFX_droplet.mp3");
  boing = loadSound("assets/nutplop2.mp3")
}

function setup() {
  createCanvas(800, 450);
  colorMode(HSB, 360, 255, 255, 255);
  noStroke();
  initAgents();
  
  if (bgm && !bgm.isPlaying()) {
    bgm.loop();
    bgm.setVolume(0.5); // adjust to taste
  }
}

// allow saving the current frame by right-click
// function mousePressed() {
//   // only trigger on right click
//   if (mouseButton === RIGHT) {
//     // format: bubble_sketch_0001.png
//     saveCanvas("bubble_sketch", "png");
//   }
// }

function initAgents() {
  agents = [];
  for (let i = 0; i < NUM_START; i++) {
    const x = random(width);
    const y = random(height);
    const sz = random(60, 100); //size range
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
      if (this.x < r) {
        this.x = r;
        this.dx = abs(this.dx);
      }
      if (this.x > width - r) {
        this.x = width - r;
        this.dx = -abs(this.dx);
      }
      if (this.y < r) {
        this.y = r;
        this.dy = abs(this.dy);
      }
      if (this.y > height - r) {
        this.y = height - r;
        this.dy = -abs(this.dy);
      }
    }

    // --- return phase ---
    if (isReturning) {
      const cx = width / 2,
        cy = height / 2;
      let vx = cx - this.x,
        vy = cy - this.y;
      const mag = sqrt(vx * vx + vy * vy) || 1;
      vx /= mag;
      vy /= mag;
      this.dx += vx * 0.08; // return speed
      this.dy += vy * 0.08; // return speed
      this.dx *= 0.97;
      this.dy *= 0.97;
    }

    // --- soft outer boundary ---
    // If bubble drifts too far (beyond 1.5× canvas), gently pull it back
    const marginX = width * 0.05; // 1.5× total span, further or nearer limit
    const marginY = height * 0.05; // this must be same as above
    if (
      this.x < -marginX ||
      this.x > width + marginX ||
      this.y < -marginY ||
      this.y > height + marginY
    ) {
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
      this.x >= r && this.x <= width - r && this.y >= r && this.y <= height - r
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
    const mag = sqrt(dx * dx + dy * dy) || 1;
    const nx = dx / mag;
    const ny = dy / mag;

    // smaller impulse each frame
    const force = map(strength, 0, 1, 0.2, 1.2);
    this.dx += nx * force;
    this.dy += ny * force;
  }

  // call to set squish target (0..1 where 1 is normal)
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

  // ----  SQUISHING ----
  if (isSquishing) {
    const held = millis() - squishStart;
    console.log(squishAmount.toFixed(2));

    squishAmount = constrain(map(held, 0, SQUISH_RAMP_MS, 0, 1), 0, 1);
  } else {
    // when not squishing, gently decay amount toward 0 so targets lerp smoothly
    squishAmount = lerp(squishAmount, 0, 0.12);
  }
  
// ---- BOUNCING AFTER SQUISH ----
  if (bounceState === "waiting") {
  let closeCount = 0;
  for (const a of agents) {
    if (abs(a.scaleX - 1) < WAIT_THRESHOLD && abs(a.scaleY - 1) < WAIT_THRESHOLD) {
      closeCount++;
    }
  }
  const elapsedSinceReturnStart = millis() - squishBounceStart; // reuse this as a timer
  // trigger when enough agents are close OR when timeout exceeded
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
}

  else if (bounceState === "overshoot") {
    // wait a short time then return fully to 1 and finish
    if (millis() - squishBounceStart >= OVERSHOOT_MS) {
      for (const a of agents) {
        a.setSquishTargets(squishAxis, 0); // back to neutral
      }
      bounceState = "idle";
    }
  }
  
  if (bounceState === 'idle' || bounceState === 'waiting') {
  // normal behavior: apply ramped squish targets while holding or decaying
  for (const a of agents) {
    a.setSquishTargets(squishAxis, squishAmount);
  }
}
// when bounceState === 'overshoot' we keep the overshoot targets already set


  // --- live pressure build-up ---
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
  if (isReturning && agents.every((a) => a.isInside())) {
    isReturning = false;
    for (const a of agents) a.resetIdle();
  }
}

// ========== INTERACTION ==========
function keyPressed() {
  if (key === "f" || key === "F") {
    isCharging = true;
    chargeStart = millis();
    pushOrigin = createVector(width / 2, height / 2);
    isReturning = false; // cancel return if in progress
    
    sfxDroplet.play();
    sfxDroplet.setVolume(0.6);
  }

  if (key === "r" || key === "R") {
    // If Shift held, force horizontal without toggling stored axis
    if (keyIsDown(SHIFT) || keyIsDown(16)) {
      squishAxis = "horizontal";
    } else {
      // toggle stored axis each press
      squishAxis = squishAxis === "vertical" ? "horizontal" : "vertical";
    }
    // start holding for ramp
    isSquishing = true;
    squishStart = millis();
    // immediate small assignment so visual responds instantly
    squishAmount = 0;
  }
}

function keyReleased() {
  if (key === "f" || key === "F") {
    isCharging = false;
    // start return when key released
    isReturning = true;
    pressure = 0;
  }

  if (key === "r" || key === "R") {
    // stop squishing; agents will smoothly lerp back to scale=1
    isSquishing = false;

    // set targets to 1 so they return to neutral first
    for (const a of agents) {
      a.setSquishTargets(squishAxis, 0); // amount=0 => targetScaleX/Y = 1
    }

    // start waiting for them to reach ~1, then we'll do the quick overshoot
    bounceState = "waiting";

    // ensure any previous timers/flags are reset
    doSquishBounce = false;
    
     boing.play();
    boing.setVolume(0.8);
  }
}

/*
===========================
   ARDUINO INTEGRATION NOTES
===========================

Later, replace the key-hold logic with your force sensor:

1 Declare:
    let sensorValue = 0;   // 0–1023
    let serial;

2 In setup():
    serial = new p5.SerialPort();
    serial.open('COM3'); // your port
    serial.on('data', () => {
      const val = Number(serial.readLine());
      if (!isNaN(val)) sensorValue = val;
    });

3 In draw(), replace held-time logic with:
    pressure = map(sensorValue, 0, 1023, 0, 1);

    if (pressure > 0.05) {
      // Apply continuous outward force while sensor is pressed
      for (const a of agents)
        a.applyOutwardForce(pushOrigin.x, pushOrigin.y, pressure);
      isCharging = true;
      ripple.active = true;
      ripple.radius = map(pressure, 0, 1, 50, 350);
      ripple.alpha = 180;
    } else if (isCharging) {
      // When released (pressure ~0), begin return
      isCharging = false;
      isReturning = true;
    }

That’s it — the same physics logic applies:
  • stronger pressure → stronger outward force  
  • releasing → bubbles float back in smoothly
*/
