// we need something to render too
const canvas = document.createElement("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

// we need the renderer context
const ctx = canvas.getContext("2d");
ctx.fillStyle = "black";
ctx.fillRect(0, 0, canvas.width, canvas.height);

// config options, we'll shove these in an object to add user control

const config = {
  // how often to spawn a new ring
  ringInterval: 0.25,
  // how fast should rings grow
  ringGrowthSpeed: 500,
  // how many circles in each ring
  ringCircleCount: 20,
  // size of the circles in the ring
  ringCircleSize: 10,
  ringCircleGrowthSpeed: 2,
  // ring trail duration
  ringTrailDuration: 1,
  // choose colours at random or in sequence
  randomColours: false,
  // allow rings to rotate
  ringRotate: true,
  ringRotateAlternate: true,
  ringRotateSpeed: 10,
  // allow launch angle to rotate
  launchAngleRotate: true,
  launchAngleRotateSpeed: 18,
  // should the ring center follow the mouse
  followMouse: false,
};

// create some colours to render

const colours = [];
for (let i = 0; i < 30; i++) {
  colours.push({
    r: Math.round(Math.sin(i * 0.2 + 0) * 127 + 128),
    g: Math.round(Math.sin(i * 0.2 + 2) * 127 + 128),
    b: Math.round(Math.sin(i * 0.2 + 4) * 127 + 128),
  });
}

// run time values

let lastUpdate = 0; // last update timestamp
let rings = []; // array to hold our rings
let nextRing = 0; // how long until next ring
let ringsCreated = 0; // how many rings created
let launchAngle = 0;
let launchPosition = { x: canvas.width / 2, y: canvas.height / 2 };
let launchPositionTarget = { x: canvas.width / 2, y: canvas.height / 2 };

// update position target on mouse move
canvas.addEventListener("mousemove", (e) => {
  if (config.followMouse) {
    launchPositionTarget = { x: e.clientX, y: e.clientY };
  }
});

// if the window is resized, update the canvas size and reset the rings
window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  resetRings();
});

// reset situation
function resetRings() {
  rings = [];
  //   lastUpdate = 0;
  ringsCreated = 0;
  launchAngle = 0;
  launchPosition = { x: canvas.width / 2, y: canvas.height / 2 };
  launchPositionTarget = { x: canvas.width / 2, y: canvas.height / 2 };
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// app methods
function checkRingSpawn(deltaTime) {
  // reset launch position if not locked to mouse
  if (!config.followMouse) {
    launchPositionTarget = { x: canvas.width / 2, y: canvas.height / 2 };
  }
  // if required update the launch position
  const dx = launchPositionTarget.x - launchPosition.x;
  const dy = launchPositionTarget.y - launchPosition.y;
  if (dx !== 0 || dy !== 0) {
    const deltaDistance = Math.sqrt(dx * dx + dy * dy);
    const deltaAngle = Math.atan2(dy, dx);
    const deltaStep = Math.min(deltaTime * 1000, deltaDistance);

    launchPosition.x += Math.cos(deltaAngle) * deltaStep;
    launchPosition.y += Math.sin(deltaAngle) * deltaStep;
  }

  // if time expired, spawn next ring
  nextRing -= deltaTime;
  if (nextRing <= 0) {
    nextRing += config.ringInterval;
    rings.push(createRing());
  }
  // update launch angle
  if (config.launchAngleRotate) {
    const angleStep = config.launchAngleRotateSpeed * (Math.PI / 180);
    launchAngle += deltaTime * angleStep;
  }
}

function createRing() {
  const colourIndex = config.randomColours
    ? Math.floor(Math.random() * colours.length)
    : ringsCreated % colours.length;
  ringsCreated++;
  return {
    // number of circles in the ring
    circles: config.ringCircleCount,
    // colour to render ring circles
    color: colours[colourIndex],
    // size to render ring circles
    size: config.ringCircleSize,
    // scale to render ring circles
    scale: 0,
    // how far rom center point to render ring circles
    distance: 10,
    // angle to render ring circles
    angle: launchAngle,
    rotateDirection: ringsCreated % 2 ? 1 : -1,
    position: { x: launchPosition.x, y: launchPosition.y },
  };
}

function updateRings(deltaTime) {
  for (let i = rings.length - 1; i >= 0; i--) {
    const ring = rings[i];
    // expand out the ring at 100 pixels per second
    ring.distance += deltaTime * config.ringGrowthSpeed;
    // increase the size of the ring circles
    ring.scale = Math.min(
      1,
      ring.scale + deltaTime / config.ringCircleGrowthSpeed
    );
    // rotate the rings if required
    if (config.ringRotate) {
      const dir = config.ringRotateAlternate ? ring.rotateDirection : 1;
      const angleStep = config.ringRotateSpeed * (Math.PI / 180);
      ring.angle += deltaTime * angleStep * dir;
    }
  }
}

function renderRings(deltaTime, rings) {
  // blackout canvas
  if (config.ringTrailDuration === 0) {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  // if we have a trail duration
  // slapping a black fill at lower alpha won't fully remove the circles
  // so we're gonna mess with the pixels themselves
  else {
    // calculate fade amount
    const deltaFade = Math.min(deltaTime / config.ringTrailDuration, 1) * 255;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] = Math.max(0, imageData.data[i] - deltaFade); // red
      imageData.data[i + 1] = Math.max(0, imageData.data[i + 1] - deltaFade); // green
      imageData.data[i + 2] = Math.max(0, imageData.data[i + 2] - deltaFade); // blue
      // we con't care about alpha
    }
    ctx.putImageData(imageData, 0, 0);
  }

  // render each ring
  for (let i = 0; i < rings.length; i++) {
    // start the path
    ctx.beginPath();

    const ring = rings[i];
    // calculate the angle step, size and position to render the circles
    const angleStep = (Math.PI * 2) / ring.circles;
    const circleSize = Math.max(2, ring.size * ring.scale);

    // render each circle
    for (let c = 0; c < ring.circles; c++) {
      const angle = ring.angle + c * angleStep;
      const x = Math.cos(angle) * ring.distance;
      const y = Math.sin(angle) * ring.distance;
      const position = launchPosition;
      ctx.moveTo(position.x + x, position.y + y);
      ctx.arc(position.x + x, position.y + y, circleSize, 0, Math.PI * 2);
    }

    // set the colour and render the circles
    ctx.fillStyle = `rgb(${ring.color.r},${ring.color.g},${ring.color.b})`;
    ctx.fill();
  }
}

// create an update loop
function update(time) {
  // grab the delta time in seconds to help with calculation
  const deltaTime = (time - lastUpdate) / 1000;
  lastUpdate = time;

  checkRingSpawn(deltaTime);

  // update the ring states
  updateRings(deltaTime);

  // render rings
  renderRings(deltaTime, rings);

  // run next tick
  requestAnimationFrame(update);
}

// start the update loop
requestAnimationFrame(update);

// lets use dat.gui to lazily add some user control
const gui = new dat.GUI();
const ringFolder = gui.addFolder("Ring Options");
ringFolder.add(config, "ringInterval").name("Interval");
ringFolder.add(config, "ringGrowthSpeed").name("Growth Speed");
ringFolder.add(config, "ringCircleCount").name("Circle Count");
ringFolder.add(config, "ringCircleSize").name("Circle Size");
ringFolder.add(config, "ringCircleGrowthSpeed").name("Circle Growth Speed");
ringFolder.add(config, "ringTrailDuration").name("Trail Duration");
ringFolder.add(config, "randomColours").name("Colours");
ringFolder.add(config, "ringRotate").name("Rotate");
ringFolder.add(config, "ringRotateAlternate").name("Rotate Alternate");
ringFolder.add(config, "ringRotateSpeed").name("Rotate Speed");
// ringFolder.add(config, "followMouse").name("Follow Mouse");
ringFolder.open();
const launchOptions = gui.addFolder("Launch Options");
launchOptions.add(config, "launchAngleRotate").name("Angle Rotate");
launchOptions.add(config, "launchAngleRotateSpeed").name("Angle Rotate Speed");
launchOptions.open();
