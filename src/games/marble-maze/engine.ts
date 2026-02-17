import * as THREE from "three";
import * as CANNON from "cannon-es";
import { type MazeLevel } from "./levels";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MarbleMazeEngine {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  world: CANNON.World;
  marbleBody: CANNON.Body;
  marbleMesh: THREE.Mesh;
  boardBody: CANNON.Body; // kept for interface compat — unused placeholder
  boardMesh: THREE.Group;
  tilt: { x: number; z: number };
  targetTilt: { x: number; z: number };
  input: { left: boolean; right: boolean; up: boolean; down: boolean };
  goalPos: { x: number; z: number };
  startPos: { x: number; z: number };
  disposed: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CELL_SIZE = 2;
const WALL_HEIGHT = 1.5;
const FLOOR_THICKNESS = 0.3;
const MARBLE_RADIUS = 0.35;
const MOVE_FORCE = 28;
const MAX_TILT = (5 * Math.PI) / 180; // 5 degrees — visual only
const TILT_SPEED = 6;
const DAMPING = 0.4;
const FALL_THRESHOLD = -5;

// Physics materials
const marbleMat = new CANNON.Material("marble");
const wallMat = new CANNON.Material("wall");
const floorMat = new CANNON.Material("floor");

// ---------------------------------------------------------------------------
// Helpers: grid position -> world position
// ---------------------------------------------------------------------------

function gridToWorld(
  row: number,
  col: number,
  rows: number,
  cols: number
): { x: number; z: number } {
  const offsetX = ((cols - 1) * CELL_SIZE) / 2;
  const offsetZ = ((rows - 1) * CELL_SIZE) / 2;
  return {
    x: col * CELL_SIZE - offsetX,
    z: row * CELL_SIZE - offsetZ,
  };
}

// ---------------------------------------------------------------------------
// initEngine
// ---------------------------------------------------------------------------

export function initEngine(
  container: HTMLDivElement,
  level: MazeLevel
): MarbleMazeEngine {
  const width = container.clientWidth || 800;
  const height = container.clientHeight || 500;

  // ---- Renderer ----
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(0x0a0a1a);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  container.appendChild(renderer.domElement);

  // ---- Scene ----
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0a0a1a, 0.025);

  // ---- Lighting ----
  const ambient = new THREE.AmbientLight(0x8888bb, 0.7);
  scene.add(ambient);

  const dirLight = new THREE.DirectionalLight(0xffffff, 1.0);
  dirLight.position.set(8, 16, 8);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.set(1024, 1024);
  dirLight.shadow.camera.near = 1;
  dirLight.shadow.camera.far = 60;
  dirLight.shadow.camera.left = -20;
  dirLight.shadow.camera.right = 20;
  dirLight.shadow.camera.top = 20;
  dirLight.shadow.camera.bottom = -20;
  scene.add(dirLight);

  const pointLight = new THREE.PointLight(0xdb2777, 0.6, 30);
  pointLight.position.set(0, 6, 0);
  scene.add(pointLight);

  // ---- Camera ----
  const grid = level.grid;
  const rows = grid.length;
  const cols = grid[0].length;
  const boardWidth = cols * CELL_SIZE;
  const boardDepth = rows * CELL_SIZE;
  const maxDim = Math.max(boardWidth, boardDepth);

  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 200);
  camera.position.set(0, maxDim * 1.1, maxDim * 0.6);
  camera.lookAt(0, 0, 0);

  // ---- Physics world ----
  const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -20, 0),
  });
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.allowSleep = false;

  // Contact materials
  const marbleFloorContact = new CANNON.ContactMaterial(marbleMat, floorMat, {
    friction: 0.3,
    restitution: 0.2,
  });
  const marbleWallContact = new CANNON.ContactMaterial(marbleMat, wallMat, {
    friction: 0.1,
    restitution: 0.4,
  });
  world.addContactMaterial(marbleFloorContact);
  world.addContactMaterial(marbleWallContact);

  // ---- Build board ----
  const boardMesh = new THREE.Group();
  scene.add(boardMesh);

  let startPos = { x: 0, z: 0 };
  let goalPos = { x: 0, z: 0 };

  // Materials for visuals
  const wallGeo = new THREE.BoxGeometry(CELL_SIZE, WALL_HEIGHT, CELL_SIZE);
  const wallMeshMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.7,
    metalness: 0.1,
  });

  const floorGeo = new THREE.BoxGeometry(
    CELL_SIZE,
    FLOOR_THICKNESS,
    CELL_SIZE
  );
  const floorMeshMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.9,
    metalness: 0.0,
  });

  const startMeshMat = new THREE.MeshStandardMaterial({
    color: 0x22c55e,
    roughness: 0.5,
    metalness: 0.1,
    emissive: 0x22c55e,
    emissiveIntensity: 0.3,
  });

  const goalMeshMat = new THREE.MeshStandardMaterial({
    color: 0xeab308,
    roughness: 0.4,
    metalness: 0.2,
    emissive: 0xeab308,
    emissiveIntensity: 0.5,
  });

  // Dummy body to satisfy the interface (board doesn't move)
  const boardBody = new CANNON.Body({ mass: 0 });
  world.addBody(boardBody);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      const { x, z } = gridToWorld(r, c, rows, cols);

      if (cell === 1) {
        // Wall — visual
        const mesh = new THREE.Mesh(wallGeo, wallMeshMat);
        mesh.position.set(x, WALL_HEIGHT / 2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        boardMesh.add(mesh);

        // Wall — physics
        const wallShape = new CANNON.Box(
          new CANNON.Vec3(CELL_SIZE / 2, WALL_HEIGHT / 2, CELL_SIZE / 2)
        );
        const body = new CANNON.Body({ mass: 0, material: wallMat });
        body.addShape(wallShape);
        body.position.set(x, WALL_HEIGHT / 2, z);
        world.addBody(body);
      } else if (cell === 2 || cell === 3 || cell === 4) {
        // Floor tile — visual
        let mat = floorMeshMat;
        if (cell === 3) mat = startMeshMat;
        if (cell === 4) mat = goalMeshMat;

        const mesh = new THREE.Mesh(floorGeo, mat);
        mesh.position.set(x, -FLOOR_THICKNESS / 2, z);
        mesh.receiveShadow = true;
        boardMesh.add(mesh);

        // Floor tile — physics
        const floorShape = new CANNON.Box(
          new CANNON.Vec3(CELL_SIZE / 2, FLOOR_THICKNESS / 2, CELL_SIZE / 2)
        );
        const body = new CANNON.Body({ mass: 0, material: floorMat });
        body.addShape(floorShape);
        body.position.set(x, -FLOOR_THICKNESS / 2, z);
        world.addBody(body);

        if (cell === 3) {
          startPos = { x, z };
        }
        if (cell === 4) {
          goalPos = { x, z };

          // Add a pulsing ring around goal
          const ringGeo = new THREE.RingGeometry(0.6, 0.8, 32);
          const ringMat = new THREE.MeshBasicMaterial({
            color: 0xeab308,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.6,
          });
          const ring = new THREE.Mesh(ringGeo, ringMat);
          ring.rotation.x = -Math.PI / 2;
          ring.position.set(x, 0.02, z);
          boardMesh.add(ring);
        }
      }
      // cell === 0 => hole, no floor or wall — marble will fall through
    }
  }

  // ---- Marble ----
  const marbleGeo = new THREE.SphereGeometry(MARBLE_RADIUS, 32, 32);
  const marbleMeshMat = new THREE.MeshStandardMaterial({
    color: 0xdb2777,
    metalness: 0.3,
    roughness: 0.2,
    emissive: 0xdb2777,
    emissiveIntensity: 0.15,
  });
  const marbleMesh = new THREE.Mesh(marbleGeo, marbleMeshMat);
  marbleMesh.castShadow = true;
  scene.add(marbleMesh);

  // Marble physics body
  const marbleShape = new CANNON.Sphere(MARBLE_RADIUS);
  const marbleBody = new CANNON.Body({
    mass: 1,
    material: marbleMat,
    linearDamping: DAMPING,
    angularDamping: 0.6,
  });
  marbleBody.addShape(marbleShape);
  marbleBody.position.set(startPos.x, MARBLE_RADIUS + 0.5, startPos.z);
  world.addBody(marbleBody);

  // Sync initial marble mesh position
  marbleMesh.position.set(startPos.x, MARBLE_RADIUS + 0.5, startPos.z);

  const engine: MarbleMazeEngine = {
    scene,
    camera,
    renderer,
    world,
    marbleBody,
    marbleMesh,
    boardBody,
    boardMesh,
    tilt: { x: 0, z: 0 },
    targetTilt: { x: 0, z: 0 },
    input: { left: false, right: false, up: false, down: false },
    goalPos,
    startPos,
    disposed: false,
  };

  // Initial render
  renderer.render(scene, camera);

  return engine;
}

// ---------------------------------------------------------------------------
// updateEngine — called every frame
// ---------------------------------------------------------------------------

export function updateEngine(engine: MarbleMazeEngine, dt: number): void {
  if (engine.disposed) return;

  const clampedDt = Math.min(dt, 0.05);

  // ---- Compute target tilt from input ----
  engine.targetTilt.x = 0;
  engine.targetTilt.z = 0;

  if (engine.input.up) engine.targetTilt.z = -MAX_TILT;
  if (engine.input.down) engine.targetTilt.z = MAX_TILT;
  if (engine.input.left) engine.targetTilt.x = -MAX_TILT;
  if (engine.input.right) engine.targetTilt.x = MAX_TILT;

  // ---- Smoothly interpolate current tilt ----
  engine.tilt.x += (engine.targetTilt.x - engine.tilt.x) * TILT_SPEED * clampedDt;
  engine.tilt.z += (engine.targetTilt.z - engine.tilt.z) * TILT_SPEED * clampedDt;

  // ---- Apply visual tilt to board group ----
  engine.boardMesh.rotation.x = engine.tilt.z;
  engine.boardMesh.rotation.z = -engine.tilt.x;

  // ---- Apply force to marble based on input (simulates tilt gravity) ----
  const forceX = engine.input.left ? -MOVE_FORCE : engine.input.right ? MOVE_FORCE : 0;
  const forceZ = engine.input.up ? -MOVE_FORCE : engine.input.down ? MOVE_FORCE : 0;

  if (forceX !== 0 || forceZ !== 0) {
    engine.marbleBody.applyForce(
      new CANNON.Vec3(forceX, 0, forceZ),
      engine.marbleBody.position
    );
  }

  // ---- Speed cap to prevent physics glitches ----
  const vel = engine.marbleBody.velocity;
  const speed = Math.sqrt(vel.x * vel.x + vel.z * vel.z);
  const maxSpeed = 12;
  if (speed > maxSpeed) {
    const scale = maxSpeed / speed;
    vel.x *= scale;
    vel.z *= scale;
  }

  // ---- Step physics ----
  engine.world.step(1 / 60, clampedDt, 3);

  // ---- Sync marble mesh to physics body ----
  engine.marbleMesh.position.set(
    engine.marbleBody.position.x,
    engine.marbleBody.position.y,
    engine.marbleBody.position.z
  );
  engine.marbleMesh.quaternion.set(
    engine.marbleBody.quaternion.x,
    engine.marbleBody.quaternion.y,
    engine.marbleBody.quaternion.z,
    engine.marbleBody.quaternion.w
  );

  // ---- Render ----
  engine.renderer.render(engine.scene, engine.camera);
}

// ---------------------------------------------------------------------------
// Utility checks
// ---------------------------------------------------------------------------

export function checkGoal(engine: MarbleMazeEngine): boolean {
  const dx = engine.marbleBody.position.x - engine.goalPos.x;
  const dz = engine.marbleBody.position.z - engine.goalPos.z;
  const dist = Math.sqrt(dx * dx + dz * dz);
  // Marble is near goal and on the board surface
  return dist < CELL_SIZE * 0.5 && engine.marbleBody.position.y > -1;
}

export function checkFall(engine: MarbleMazeEngine): boolean {
  return engine.marbleBody.position.y < FALL_THRESHOLD;
}

export function resetMarble(engine: MarbleMazeEngine): void {
  engine.marbleBody.position.set(
    engine.startPos.x,
    MARBLE_RADIUS + 0.5,
    engine.startPos.z
  );
  engine.marbleBody.velocity.set(0, 0, 0);
  engine.marbleBody.angularVelocity.set(0, 0, 0);
  engine.marbleBody.force.set(0, 0, 0);
  engine.marbleBody.torque.set(0, 0, 0);

  // Sync visual immediately
  engine.marbleMesh.position.set(
    engine.startPos.x,
    MARBLE_RADIUS + 0.5,
    engine.startPos.z
  );
}

// ---------------------------------------------------------------------------
// resizeEngine
// ---------------------------------------------------------------------------

export function resizeEngine(
  engine: MarbleMazeEngine,
  w: number,
  h: number
): void {
  engine.camera.aspect = w / h;
  engine.camera.updateProjectionMatrix();
  engine.renderer.setSize(w, h);
}

// ---------------------------------------------------------------------------
// disposeEngine
// ---------------------------------------------------------------------------

export function disposeEngine(engine: MarbleMazeEngine): void {
  engine.disposed = true;

  // Remove renderer from DOM
  engine.renderer.domElement.remove();

  // Dispose Three.js resources
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
  });
}
