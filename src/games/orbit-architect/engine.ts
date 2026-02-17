import * as THREE from "three";
import { useOrbitStore } from "./store";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CelestialBody {
  mesh: THREE.Mesh;
  trail: THREE.Line;
  trailPoints: THREE.Vector3[];
  mass: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  prevPosition: THREE.Vector3; // for Verlet integration
  radius: number;
  color: string;
  alive: boolean;
  angularDisplacement: number; // cumulative radians travelled around the star
  lastAngle: number; // previous frame angle (atan2)
}

export interface OrbitEngine {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  star: CelestialBody;
  planets: CelestialBody[];
  simulating: boolean;
  simTime: number;
  maxSimTime: number;
  placementMode: boolean;
  dragStart: THREE.Vector2 | null;
  dragCurrent: THREE.Vector2 | null;
  velocityArrow: THREE.ArrowHelper | null;
  ghostMesh: THREE.Mesh | null; // preview sphere shown at click position
  disposed: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const G = 2.5; // gravitational constant (tunable)
const MAX_TRAIL_LENGTH = 200;
const STAR_RADIUS = 1.2;
const STAR_MASS = 1000;
const PLANET_RADIUS = 0.4;
const PLANET_MASS = 1;
const ESCAPE_RADIUS = 50;
const MAX_SIM_TIME = 30; // seconds
const VELOCITY_SCALE = 0.15; // maps drag‑pixel length to velocity magnitude
const PLANET_COLORS = ["#00fff5", "#ff2d95", "#39ff14", "#ffe600", "#a855f7"];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createStarMesh(): THREE.Mesh {
  const geo = new THREE.SphereGeometry(STAR_RADIUS, 32, 32);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffe066,
    emissive: 0xffaa00,
    emissiveIntensity: 1.5,
  });
  return new THREE.Mesh(geo, mat);
}

function createStarGlow(scene: THREE.Scene): void {
  // A simple additive‑blended sprite for a glow effect
  const spriteMat = new THREE.SpriteMaterial({
    color: 0xffcc44,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(6, 6, 1);
  scene.add(sprite);
}

function nextPlanetColor(index: number): string {
  return PLANET_COLORS[index % PLANET_COLORS.length];
}

function createPlanetMesh(color: string): THREE.Mesh {
  const geo = new THREE.SphereGeometry(PLANET_RADIUS, 24, 24);
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.4,
  });
  return new THREE.Mesh(geo, mat);
}

function createTrailLine(color: string): THREE.Line {
  const geo = new THREE.BufferGeometry();
  // Pre‑allocate positions buffer
  const positions = new Float32Array(MAX_TRAIL_LENGTH * 3);
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setDrawRange(0, 0);
  const mat = new THREE.LineBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.6,
  });
  return new THREE.Line(geo, mat);
}

function updateTrailGeometry(trail: THREE.Line, points: THREE.Vector3[]): void {
  const posAttr = trail.geometry.getAttribute("position") as THREE.BufferAttribute;
  const arr = posAttr.array as Float32Array;
  for (let i = 0; i < points.length; i++) {
    arr[i * 3] = points[i].x;
    arr[i * 3 + 1] = points[i].y;
    arr[i * 3 + 2] = points[i].z;
  }
  posAttr.needsUpdate = true;
  trail.geometry.setDrawRange(0, points.length);
}

// ---------------------------------------------------------------------------
// Grid helper (subtle reference grid)
// ---------------------------------------------------------------------------

function createGrid(scene: THREE.Scene): void {
  const gridHelper = new THREE.GridHelper(100, 50, 0x111122, 0x0a0a18);
  gridHelper.rotation.x = Math.PI / 2; // make it on the XY plane (z=0)
  scene.add(gridHelper);
}

// ---------------------------------------------------------------------------
// Raycasting helpers
// ---------------------------------------------------------------------------

const _raycaster = new THREE.Raycaster();
const _plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); // z=0 plane

function screenToWorld(
  ndc: THREE.Vector2,
  camera: THREE.PerspectiveCamera
): THREE.Vector3 | null {
  _raycaster.setFromCamera(ndc, camera);
  const target = new THREE.Vector3();
  const hit = _raycaster.ray.intersectPlane(_plane, target);
  return hit ? target : null;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function initEngine(container: HTMLDivElement): OrbitEngine {
  const width = container.clientWidth || 800;
  const height = container.clientHeight || 500;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(0x030308);
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  container.appendChild(renderer.domElement);

  // Scene
  const scene = new THREE.Scene();

  // Lighting
  const ambient = new THREE.AmbientLight(0x444466, 1.2);
  scene.add(ambient);
  const point = new THREE.PointLight(0xffcc44, 2, 80);
  point.position.set(0, 0, 5);
  scene.add(point);

  // Camera — looking down at the orbital plane (z=0)
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 200);
  camera.position.set(0, 0, 40);
  camera.lookAt(0, 0, 0);

  // Background grid
  createGrid(scene);

  // Star
  const starMesh = createStarMesh();
  scene.add(starMesh);
  createStarGlow(scene);

  const star: CelestialBody = {
    mesh: starMesh,
    trail: new THREE.Line(new THREE.BufferGeometry(), new THREE.LineBasicMaterial()),
    trailPoints: [],
    mass: STAR_MASS,
    position: new THREE.Vector3(0, 0, 0),
    velocity: new THREE.Vector3(0, 0, 0),
    prevPosition: new THREE.Vector3(0, 0, 0),
    radius: STAR_RADIUS,
    color: "#ffe066",
    alive: true,
    angularDisplacement: 0,
    lastAngle: 0,
  };

  // Boundary ring (visual indicator of escape radius)
  const ringGeo = new THREE.RingGeometry(ESCAPE_RADIUS - 0.1, ESCAPE_RADIUS + 0.1, 128);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x222244,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.3,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  scene.add(ring);

  const engine: OrbitEngine = {
    scene,
    camera,
    renderer,
    star,
    planets: [],
    simulating: false,
    simTime: 0,
    maxSimTime: MAX_SIM_TIME,
    placementMode: true,
    dragStart: null,
    dragCurrent: null,
    velocityArrow: null,
    ghostMesh: null,
    disposed: false,
  };

  // Initial render
  renderer.render(scene, camera);

  return engine;
}

// ---------------------------------------------------------------------------

export function addPlanet(
  engine: OrbitEngine,
  worldPos: THREE.Vector3,
  velocity: THREE.Vector3
): void {
  const store = useOrbitStore.getState();
  if (engine.planets.length >= store.maxPlanets) return;
  if (engine.simulating) return;

  const colorIdx = engine.planets.length;
  const color = nextPlanetColor(colorIdx);

  const mesh = createPlanetMesh(color);
  mesh.position.copy(worldPos);
  engine.scene.add(mesh);

  const trail = createTrailLine(color);
  engine.scene.add(trail);

  const angle = Math.atan2(worldPos.y, worldPos.x);

  const body: CelestialBody = {
    mesh,
    trail,
    trailPoints: [worldPos.clone()],
    mass: PLANET_MASS,
    position: worldPos.clone(),
    velocity: velocity.clone(),
    prevPosition: worldPos.clone().sub(velocity.clone().multiplyScalar(1 / 60)),
    radius: PLANET_RADIUS,
    color,
    alive: true,
    angularDisplacement: 0,
    lastAngle: angle,
  };

  engine.planets.push(body);

  store.setPlanetCount(engine.planets.length);
  store.setAlivePlanets(engine.planets.filter((p) => p.alive).length);
}

// ---------------------------------------------------------------------------

export function startSimulation(engine: OrbitEngine): void {
  if (engine.planets.length === 0) return;
  engine.simulating = true;
  engine.placementMode = false;
  engine.simTime = 0;

  // Remove ghost / arrow if still visible
  cleanupPlacementVisuals(engine);

  const store = useOrbitStore.getState();
  store.setPhase("simulating");
  store.setAlivePlanets(engine.planets.filter((p) => p.alive).length);
}

// ---------------------------------------------------------------------------

export function updateEngine(engine: OrbitEngine, dt: number): void {
  if (engine.disposed) return;

  // Clamp dt to prevent explosions after tab‑switch
  const clampedDt = Math.min(dt, 0.05);

  if (engine.simulating) {
    // Sub‑step for stability
    const subSteps = 4;
    const subDt = clampedDt / subSteps;

    for (let s = 0; s < subSteps; s++) {
      stepSimulation(engine, subDt);
    }

    engine.simTime += clampedDt;

    // Update store
    const store = useOrbitStore.getState();
    store.setSimTime(engine.simTime);
    store.setAlivePlanets(engine.planets.filter((p) => p.alive).length);

    // Update trails
    for (const planet of engine.planets) {
      if (!planet.alive) continue;
      planet.trailPoints.push(planet.position.clone());
      if (planet.trailPoints.length > MAX_TRAIL_LENGTH) {
        planet.trailPoints.shift();
      }
      updateTrailGeometry(planet.trail, planet.trailPoints);
    }

    // Check end condition
    if (engine.simTime >= engine.maxSimTime) {
      engine.simulating = false;
      const score = getScore(engine);
      store.setScore(score);
      store.setPhase("done");
    }

    // Also end if ALL planets are dead
    const anyAlive = engine.planets.some((p) => p.alive);
    if (!anyAlive) {
      engine.simulating = false;
      const score = getScore(engine);
      store.setScore(score);
      store.setPhase("done");
    }
  }

  // Render
  engine.renderer.render(engine.scene, engine.camera);
}

// ---------------------------------------------------------------------------

function stepSimulation(engine: OrbitEngine, dt: number): void {
  const bodies: CelestialBody[] = [engine.star, ...engine.planets];

  // Compute accelerations from gravity (N-body)
  for (const planet of engine.planets) {
    if (!planet.alive) continue;

    const accel = new THREE.Vector3(0, 0, 0);

    for (const other of bodies) {
      if (other === planet) continue;
      if (!other.alive) continue;

      const diff = new THREE.Vector3().subVectors(other.position, planet.position);
      const distSq = diff.lengthSq();
      const dist = Math.sqrt(distSq);

      // Skip extreme proximity to avoid singularity
      if (dist < 0.01) continue;

      // Softened gravity: F = G * m1 * m2 / (r^2 + epsilon)
      const forceMag = (G * other.mass * planet.mass) / (distSq + 0.1);
      const forceDir = diff.normalize();
      accel.add(forceDir.multiplyScalar(forceMag / planet.mass));
    }

    // Verlet integration
    const newPos = new THREE.Vector3()
      .copy(planet.position)
      .multiplyScalar(2)
      .sub(planet.prevPosition)
      .add(accel.multiplyScalar(dt * dt));

    planet.prevPosition.copy(planet.position);
    planet.position.copy(newPos);

    // Derive velocity (for scoring / display, not used in integration)
    planet.velocity.subVectors(planet.position, planet.prevPosition).divideScalar(dt);

    // Update mesh
    planet.mesh.position.copy(planet.position);

    // Angular displacement tracking
    const angle = Math.atan2(planet.position.y, planet.position.x);
    let dAngle = angle - planet.lastAngle;
    // Wrap around +-pi
    if (dAngle > Math.PI) dAngle -= 2 * Math.PI;
    if (dAngle < -Math.PI) dAngle += 2 * Math.PI;
    planet.angularDisplacement += Math.abs(dAngle);
    planet.lastAngle = angle;

    // Collision with star
    const distToStar = planet.position.distanceTo(engine.star.position);
    if (distToStar < engine.star.radius + planet.radius * 0.5) {
      killPlanet(planet, engine);
    }

    // Escape detection
    if (planet.position.length() > ESCAPE_RADIUS) {
      killPlanet(planet, engine);
    }
  }
}

function killPlanet(planet: CelestialBody, engine: OrbitEngine): void {
  planet.alive = false;
  planet.mesh.visible = false;
  // Keep trail visible as a ghost trail
  (planet.trail.material as THREE.LineBasicMaterial).opacity = 0.2;
}

// ---------------------------------------------------------------------------

export function getScore(engine: OrbitEngine): number {
  let score = 0;
  for (const planet of engine.planets) {
    // Survival bonus
    if (planet.alive) {
      score += 200;
    }

    // Orbit bonus: each full 2*pi of angular displacement = 1 orbit
    const orbits = Math.floor(planet.angularDisplacement / (2 * Math.PI));
    score += orbits * 100;
  }
  return score;
}

// ---------------------------------------------------------------------------

export function resizeEngine(engine: OrbitEngine, w: number, h: number): void {
  engine.camera.aspect = w / h;
  engine.camera.updateProjectionMatrix();
  engine.renderer.setSize(w, h);
}

// ---------------------------------------------------------------------------

export function disposeEngine(engine: OrbitEngine): void {
  engine.disposed = true;
  engine.renderer.domElement.remove();
  engine.renderer.dispose();
  engine.scene.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.geometry.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose());
      } else {
        obj.material.dispose();
      }
    }
    if (obj instanceof THREE.Line) {
      obj.geometry.dispose();
      if (Array.isArray(obj.material)) {
        obj.material.forEach((m) => m.dispose());
      } else {
        (obj.material as THREE.Material).dispose();
      }
    }
  });
}

// ---------------------------------------------------------------------------
// Placement visuals helpers (used from index.tsx mouse handlers)
// ---------------------------------------------------------------------------

export function showGhostPlanet(engine: OrbitEngine, worldPos: THREE.Vector3): void {
  if (engine.ghostMesh) {
    engine.ghostMesh.position.copy(worldPos);
    return;
  }
  const colorIdx = engine.planets.length;
  const color = nextPlanetColor(colorIdx);
  const geo = new THREE.SphereGeometry(PLANET_RADIUS, 24, 24);
  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    emissive: new THREE.Color(color),
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.5,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.copy(worldPos);
  engine.scene.add(mesh);
  engine.ghostMesh = mesh;
}

export function updateVelocityArrow(
  engine: OrbitEngine,
  origin: THREE.Vector3,
  direction: THREE.Vector3,
  length: number
): void {
  if (engine.velocityArrow) {
    engine.scene.remove(engine.velocityArrow);
    engine.velocityArrow.dispose();
    engine.velocityArrow = null;
  }
  if (length < 0.01) return;

  const colorIdx = engine.planets.length;
  const color = new THREE.Color(nextPlanetColor(colorIdx));
  const arrow = new THREE.ArrowHelper(
    direction.clone().normalize(),
    origin,
    length,
    color,
    length * 0.2,
    length * 0.1
  );
  engine.scene.add(arrow);
  engine.velocityArrow = arrow;
}

export function cleanupPlacementVisuals(engine: OrbitEngine): void {
  if (engine.velocityArrow) {
    engine.scene.remove(engine.velocityArrow);
    engine.velocityArrow.dispose();
    engine.velocityArrow = null;
  }
  if (engine.ghostMesh) {
    engine.scene.remove(engine.ghostMesh);
    (engine.ghostMesh.geometry as THREE.BufferGeometry).dispose();
    ((engine.ghostMesh.material as THREE.Material)).dispose();
    engine.ghostMesh = null;
  }
}

export function screenToWorldPos(
  engine: OrbitEngine,
  clientX: number,
  clientY: number
): THREE.Vector3 | null {
  const rect = engine.renderer.domElement.getBoundingClientRect();
  const ndc = new THREE.Vector2(
    ((clientX - rect.left) / rect.width) * 2 - 1,
    -((clientY - rect.top) / rect.height) * 2 + 1
  );
  return screenToWorld(ndc, engine.camera);
}

export { VELOCITY_SCALE };
