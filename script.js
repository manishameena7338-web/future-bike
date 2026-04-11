import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';

const sceneHost = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(sceneHost.clientWidth, sceneHost.clientHeight);
sceneHost.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x020d08, 7, 20);

const camera = new THREE.PerspectiveCamera(45, sceneHost.clientWidth / sceneHost.clientHeight, 0.1, 100);
camera.position.set(4.5, 2.3, 7.5);

const ambient = new THREE.AmbientLight(0x88ffbb, 0.7);
scene.add(ambient);
const keyLight = new THREE.DirectionalLight(0xaaffdd, 1.6);
keyLight.position.set(5, 7, 4);
scene.add(keyLight);

const rimLight = new THREE.PointLight(0x39ff14, 2, 20);
rimLight.position.set(-4, 2, -5);
scene.add(rimLight);

const floor = new THREE.Mesh(
  new THREE.CircleGeometry(8, 64),
  new THREE.MeshStandardMaterial({ color: 0x09311f, roughness: 0.8, metalness: 0.2 })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.2;
scene.add(floor);

const bike = new THREE.Group();
scene.add(bike);

const bodyMat = new THREE.MeshPhysicalMaterial({
  color: 0x19ff67,
  metalness: 0.8,
  roughness: 0.28,
  clearcoat: 1,
  clearcoatRoughness: 0.1
});
const darkMat = new THREE.MeshStandardMaterial({ color: 0x101110, metalness: 0.85, roughness: 0.4 });
const steelMat = new THREE.MeshStandardMaterial({ color: 0x8ea4a2, metalness: 1, roughness: 0.2 });

const chassis = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.5, 0.85), bodyMat);
chassis.position.set(0, 0, 0);
bike.add(chassis);

const tank = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 1.2, 6, 16), bodyMat);
tank.rotation.z = Math.PI / 2;
tank.position.set(-0.2, 0.55, 0);
bike.add(tank);

const seat = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.25, 0.6), darkMat);
seat.position.set(-1.35, 0.45, 0);
bike.add(seat);

const nose = new THREE.Mesh(new THREE.ConeGeometry(0.42, 1, 16), bodyMat);
nose.rotation.z = -Math.PI / 2;
nose.position.set(1.9, 0.2, 0);
bike.add(nose);

const engine = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 0.6), darkMat);
engine.position.set(-0.2, -0.45, 0);
bike.add(engine);

const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 1.5, 20), steelMat);
pipe.rotation.z = Math.PI / 2.8;
pipe.position.set(-1.1, -0.58, -0.38);
bike.add(pipe);

const wingletGeometry = new THREE.BoxGeometry(0.45, 0.08, 0.26);
const wingletL = new THREE.Mesh(wingletGeometry, bodyMat);
wingletL.position.set(1.05, 0.1, 0.55);
wingletL.rotation.y = 0.4;
const wingletR = wingletL.clone();
wingletR.position.z = -0.55;
wingletR.rotation.y = -0.4;
bike.add(wingletL, wingletR);

function createWheel(xPos) {
  const wheel = new THREE.Group();
  const tire = new THREE.Mesh(new THREE.TorusGeometry(0.78, 0.16, 20, 60), darkMat);
  tire.rotation.y = Math.PI / 2;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.54, 0.06, 16, 40), steelMat);
  rim.rotation.y = Math.PI / 2;

  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 20), steelMat);
  hub.rotation.z = Math.PI / 2;

  wheel.add(tire, rim, hub);
  wheel.position.set(xPos, -0.88, 0);
  return wheel;
}

const frontWheel = createWheel(1.85);
const rearWheel = createWheel(-1.8);
bike.add(frontWheel, rearWheel);

bike.position.y = -0.1;

let scrollT = 0;
window.addEventListener('scroll', () => {
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  scrollT = maxScroll > 0 ? window.scrollY / maxScroll : 0;
});

window.addEventListener('resize', () => {
  renderer.setSize(sceneHost.clientWidth, sceneHost.clientHeight);
  camera.aspect = sceneHost.clientWidth / sceneHost.clientHeight;
  camera.updateProjectionMatrix();
});

const button = document.getElementById('engineToggle');
let audioCtx;
let oscillator;
let gainNode;
let running = false;

function startEngine() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  oscillator = audioCtx.createOscillator();
  const mod = audioCtx.createOscillator();
  gainNode = audioCtx.createGain();
  const modGain = audioCtx.createGain();

  oscillator.type = 'sawtooth';
  oscillator.frequency.value = 72;
  mod.frequency.value = 12;
  modGain.gain.value = 8;
  gainNode.gain.value = 0.03;

  mod.connect(modGain);
  modGain.connect(oscillator.frequency);
  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  mod.start();

  running = true;
  button.textContent = 'Stop Engine Sound';
}

function stopEngine() {
  oscillator.stop();
  audioCtx.close();
  running = false;
  button.textContent = 'Start Engine Sound';
}

button.addEventListener('click', () => {
  if (running) {
    stopEngine();
  } else {
    startEngine();
  }
});

const clock = new THREE.Clock();
function animate() {
  const elapsed = clock.getElapsedTime();
  const idleMove = Math.sin(elapsed * 2) * 0.03;

  bike.rotation.y = -0.35 + scrollT * 0.85;
  bike.rotation.z = idleMove;
  bike.position.x = (scrollT - 0.5) * 1.4;

  const spin = elapsed * 4 + scrollT * 35;
  frontWheel.rotation.z = spin;
  rearWheel.rotation.z = spin;

  camera.position.x = 4.5 - scrollT * 2.4;
  camera.position.y = 2.3 + scrollT * 0.8;
  camera.lookAt(0, -0.15, 0);

  if (running && oscillator) {
    oscillator.frequency.value = 72 + scrollT * 80 + Math.sin(elapsed * 8) * 3;
    gainNode.gain.value = 0.03 + scrollT * 0.02;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

animate();
