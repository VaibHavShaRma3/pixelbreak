import * as THREE from "three";
import type { Level } from "./levels";

// ---------------------------------------------------------------------------
// Face‑tracking helpers
// ---------------------------------------------------------------------------
// Indices: 0=top, 1=bottom, 2=front(+z), 3=back(-z), 4=left(-x), 5=right(+x)
// After a roll, the six positions are permuted depending on the direction.

function rollFacesForward(faces: number[]): number[] {
  // Rolling toward +z  (front)
  const [top, bottom, front, back, left, right] = faces;
  return [back, front, top, bottom, left, right];
}

function rollFacesBackward(faces: number[]): number[] {
  // Rolling toward -z  (back)
  const [top, bottom, front, back, left, right] = faces;
  return [front, back, bottom, top, left, right];
}

function rollFacesRight(faces: number[]): number[] {
  // Rolling toward +x  (right)
  const [top, bottom, front, back, left, right] = faces;
  return [left, right, front, back, top, bottom];
}

function rollFacesLeft(faces: number[]): number[] {
  // Rolling toward -x  (left)
  const [top, bottom, front, back, left, right] = faces;
  return [right, left, front, back, bottom, top];
}

// ---------------------------------------------------------------------------
// Face colors for cube
// ---------------------------------------------------------------------------
const FACE_COLORS = [
  0xff4444, // 0 — red
  0x44aaff, // 1 — blue
  0x44ff44, // 2 — green
  0xffaa00, // 3 — orange
  0xff44ff, // 4 — magenta
  0xffff44, // 5 — yellow
];

const FACE_COLOR_NAMES = ["Red", "Blue", "Green", "Orange", "Magenta", "Yellow"];

export function getFaceColorName(faceIndex: number): string {
  return FACE_COLOR_NAMES[faceIndex] ?? "Unknown";
}

// ---------------------------------------------------------------------------
// Engine interface
// ---------------------------------------------------------------------------
export interface CubeRollEngine {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  cube: THREE.Mesh;
  gridGroup: THREE.Group;
  cubePos: { x: number; z: number };
  startPos: { x: number; z: number };
  cubeFaces: number[]; // [top, bottom, front, back, left, right]
  isAnimating: boolean;
  animationProgress: number;
  animationDuration: number;
  animationDir: { dx: number; dz: number };
  pivot: THREE.Group;
  pivotTarget: number; // radians to rotate
  pivotAxis: THREE.Vector3;
  disposed: boolean;
  level: Level;
  goalMesh: THREE.Mesh | null;
  goalGlowTime: number;
}

// ---------------------------------------------------------------------------
// Init
// ---------------------------------------------------------------------------
export function initEngine(
  container: HTMLDivElement,
  level: Level
): CubeRollEngine {
  const width = container.clientWidth || 800;
  const height = container.clientHeight || 500;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(0x0a0a1a);
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  container.appendChild(renderer.domElement);

  // Scene
  const scene = new THREE.Scene();

  // Lighting
  const ambient = new THREE.AmbientLight(0x808090, 1.2);
  scene.add(ambient);
  const directional = new THREE.DirectionalLight(0xffffff, 0.9);
  directional.position.set(5, 10, 5);
  scene.add(directional);

  // Camera — isometric‑style perspective
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 200);

  // Find grid dimensions for camera centering
  const rows = level.grid.length;
  const cols = level.grid[0].length;
  const centerX = (cols - 1) / 2;
  const centerZ = (rows - 1) / 2;
  const maxDim = Math.max(rows, cols);
  const camDist = maxDim * 1.4 + 3;

  camera.position.set(centerX + camDist * 0.6, camDist * 0.8, centerZ + camDist * 0.6);
  camera.lookAt(centerX, 0, centerZ);

  // Build grid
  const gridGroup = new THREE.Group();
  scene.add(gridGroup);

  let startX = 0;
  let startZ = 0;
  let goalMesh: THREE.Mesh | null = null;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = level.grid[r][c];
      if (cell === 0) continue; // hole

      const tileGeo = new THREE.BoxGeometry(0.95, 0.1, 0.95);
      let tileColor = 0x333344; // default floor
      let emissive = 0x000000;

      if (cell === 2) {
        tileColor = 0x22cc66;
        emissive = 0x115533;
      } else if (cell === 3) {
        tileColor = 0x7c3aed;
        emissive = 0x3c1a7d;
        startX = c;
        startZ = r;
      }

      const tileMat = new THREE.MeshStandardMaterial({
        color: tileColor,
        emissive: emissive,
        roughness: 0.6,
        metalness: 0.2,
      });
      const tileMesh = new THREE.Mesh(tileGeo, tileMat);
      tileMesh.position.set(c, -0.05, r);
      gridGroup.add(tileMesh);

      if (cell === 2) {
        goalMesh = tileMesh;
      }
    }
  }

  // Cube — six faces, each a different color
  const cubeGeo = new THREE.BoxGeometry(0.9, 0.9, 0.9);
  const cubeMaterials = FACE_COLORS.map(
    (color) =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.35,
        metalness: 0.15,
      })
  );
  // Three.js box face order: +x, -x, +y, -y, +z, -z
  // Map our logical faces to Three.js material indices:
  //   Three.js: 0=+x(right), 1=-x(left), 2=+y(top), 3=-y(bottom), 4=+z(front), 5=-z(back)
  // We want each face to show its own color at start.
  // Logical: 0=top, 1=bottom, 2=front, 3=back, 4=left, 5=right
  // So material array for Three.js: [right(5), left(4), top(0), bottom(1), front(2), back(3)]
  const orderedMaterials = [
    cubeMaterials[5], // +x = right
    cubeMaterials[4], // -x = left
    cubeMaterials[0], // +y = top
    cubeMaterials[1], // -y = bottom
    cubeMaterials[2], // +z = front
    cubeMaterials[3], // -z = back
  ];
  const cube = new THREE.Mesh(cubeGeo, orderedMaterials);
  cube.position.set(startX, 0.45, startZ);
  scene.add(cube);

  // Pivot group for rolling animation
  const pivot = new THREE.Group();
  scene.add(pivot);

  const engine: CubeRollEngine = {
    scene,
    camera,
    renderer,
    cube,
    gridGroup,
    cubePos: { x: startX, z: startZ },
    startPos: { x: startX, z: startZ },
    cubeFaces: [0, 1, 2, 3, 4, 5], // [top, bottom, front, back, left, right]
    isAnimating: false,
    animationProgress: 0,
    animationDuration: 0.2,
    animationDir: { dx: 0, dz: 0 },
    pivot,
    pivotTarget: 0,
    pivotAxis: new THREE.Vector3(),
    disposed: false,
    level,
    goalMesh,
    goalGlowTime: 0,
  };

  // Initial render
  renderer.render(scene, camera);

  return engine;
}

// ---------------------------------------------------------------------------
// Start a move
// ---------------------------------------------------------------------------
export function startMove(
  engine: CubeRollEngine,
  dx: number,
  dz: number
): boolean {
  if (engine.isAnimating || engine.disposed) return false;

  const targetX = engine.cubePos.x + dx;
  const targetZ = engine.cubePos.z + dz;

  // Bounds check
  const rows = engine.level.grid.length;
  const cols = engine.level.grid[0].length;
  if (targetX < 0 || targetX >= cols || targetZ < 0 || targetZ >= rows) {
    return false;
  }

  // Check target cell exists (not a hole — we allow rolling into holes but
  // the cube will fall; however for UX we block movement into out‑of‑bounds
  // but allow holes so the player can see the fall)
  // Actually, let's allow moving toward any in‑bounds cell. If it's a hole,
  // the post‑roll check will handle it.

  engine.isAnimating = true;
  engine.animationProgress = 0;
  engine.animationDir = { dx, dz };

  // Set up pivot at the edge of the cube in the direction of movement
  const cubeWorldX = engine.cubePos.x;
  const cubeWorldZ = engine.cubePos.z;

  // Pivot point is at the bottom edge in the roll direction
  const pivotX = cubeWorldX + dx * 0.45;
  const pivotZ = cubeWorldZ + dz * 0.45;
  const pivotY = 0; // ground level

  engine.pivot.position.set(pivotX, pivotY, pivotZ);
  engine.pivot.rotation.set(0, 0, 0);

  // Attach cube to pivot (convert cube world pos to pivot local space)
  engine.scene.remove(engine.cube);
  engine.pivot.add(engine.cube);
  engine.cube.position.set(
    cubeWorldX - pivotX,
    0.45 - pivotY,
    cubeWorldZ - pivotZ
  );

  // Determine rotation axis (perpendicular to movement direction, horizontal)
  // Rolling along +x → rotate around -z axis
  // Rolling along -x → rotate around +z axis
  // Rolling along +z → rotate around +x axis
  // Rolling along -z → rotate around -x axis
  if (dx === 1) {
    engine.pivotAxis = new THREE.Vector3(0, 0, -1);
  } else if (dx === -1) {
    engine.pivotAxis = new THREE.Vector3(0, 0, 1);
  } else if (dz === 1) {
    engine.pivotAxis = new THREE.Vector3(1, 0, 0);
  } else if (dz === -1) {
    engine.pivotAxis = new THREE.Vector3(-1, 0, 0);
  }

  engine.pivotTarget = Math.PI / 2;

  return true;
}

// ---------------------------------------------------------------------------
// Complete a roll — finalize position and face tracking
// ---------------------------------------------------------------------------
function completeRoll(engine: CubeRollEngine): {
  fell: boolean;
  reachedGoal: boolean;
  correctFace: boolean;
} {
  const { dx, dz } = engine.animationDir;
  const newX = engine.cubePos.x + dx;
  const newZ = engine.cubePos.z + dz;

  // Update face orientation
  if (dx === 1) {
    engine.cubeFaces = rollFacesRight(engine.cubeFaces);
  } else if (dx === -1) {
    engine.cubeFaces = rollFacesLeft(engine.cubeFaces);
  } else if (dz === 1) {
    engine.cubeFaces = rollFacesForward(engine.cubeFaces);
  } else if (dz === -1) {
    engine.cubeFaces = rollFacesBackward(engine.cubeFaces);
  }

  // Detach cube from pivot back to scene
  engine.pivot.remove(engine.cube);
  engine.scene.add(engine.cube);

  // Snap cube to new grid position
  engine.cube.position.set(newX, 0.45, newZ);

  // Reset cube rotation to align with the new face orientation.
  // Instead of accumulating quaternion drift, we reconstruct the rotation
  // from the face state so the cube stays perfectly aligned.
  engine.cube.rotation.set(0, 0, 0);
  engine.cube.quaternion.identity();

  // Apply the visual rotation that matches our face tracking.
  // We need to re‑assign materials so visual colors match the logical face
  // positions. This is cleaner than tracking accumulated rotation.
  reassignCubeMaterials(engine);

  engine.cubePos = { x: newX, z: newZ };
  engine.isAnimating = false;
  engine.animationProgress = 0;

  // Reset pivot
  engine.pivot.rotation.set(0, 0, 0);

  // Check if cell is a hole
  const cell = engine.level.grid[newZ]?.[newX] ?? 0;
  if (cell === 0) {
    return { fell: true, reachedGoal: false, correctFace: false };
  }

  // Check if reached goal
  if (cell === 2) {
    const topFace = engine.cubeFaces[0];
    const correct = topFace === engine.level.targetFace;
    return { fell: false, reachedGoal: true, correctFace: correct };
  }

  return { fell: false, reachedGoal: false, correctFace: false };
}

// ---------------------------------------------------------------------------
// Reassign materials so visual colors always match logical face positions
// ---------------------------------------------------------------------------
function reassignCubeMaterials(engine: CubeRollEngine) {
  const faces = engine.cubeFaces; // [top, bottom, front, back, left, right]
  const mats = FACE_COLORS.map(
    (color) =>
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.35,
        metalness: 0.15,
      })
  );
  // Three.js box face order: +x(right), -x(left), +y(top), -y(bottom), +z(front), -z(back)
  const orderedMaterials = [
    mats[faces[5]], // +x = logical right
    mats[faces[4]], // -x = logical left
    mats[faces[0]], // +y = logical top
    mats[faces[1]], // -y = logical bottom
    mats[faces[2]], // +z = logical front
    mats[faces[3]], // -z = logical back
  ];
  engine.cube.material = orderedMaterials;
}

// ---------------------------------------------------------------------------
// Reset cube to start
// ---------------------------------------------------------------------------
export function resetToStart(engine: CubeRollEngine): void {
  // Detach from pivot if mid‑animation
  if (engine.isAnimating) {
    engine.pivot.remove(engine.cube);
    engine.scene.add(engine.cube);
  }

  engine.cubePos = { x: engine.startPos.x, z: engine.startPos.z };
  engine.cube.position.set(engine.startPos.x, 0.45, engine.startPos.z);
  engine.cube.rotation.set(0, 0, 0);
  engine.cube.quaternion.identity();

  engine.cubeFaces = [0, 1, 2, 3, 4, 5];
  reassignCubeMaterials(engine);

  engine.isAnimating = false;
  engine.animationProgress = 0;
  engine.pivot.rotation.set(0, 0, 0);
}

// ---------------------------------------------------------------------------
// Get top face index
// ---------------------------------------------------------------------------
export function getTopFace(engine: CubeRollEngine): number {
  return engine.cubeFaces[0];
}

// ---------------------------------------------------------------------------
// Update (called every frame)
// ---------------------------------------------------------------------------
export type RollResult = {
  fell: boolean;
  reachedGoal: boolean;
  correctFace: boolean;
} | null;

export function updateEngine(
  engine: CubeRollEngine,
  dt: number
): RollResult {
  if (engine.disposed) return null;

  const clampedDt = Math.min(dt, 0.05);

  // Animate goal tile glow
  engine.goalGlowTime += clampedDt;
  if (engine.goalMesh) {
    const mat = engine.goalMesh.material as THREE.MeshStandardMaterial;
    const pulse = 0.3 + 0.2 * Math.sin(engine.goalGlowTime * 3);
    mat.emissiveIntensity = pulse;
  }

  let result: RollResult = null;

  // Handle roll animation
  if (engine.isAnimating) {
    engine.animationProgress += clampedDt / engine.animationDuration;

    if (engine.animationProgress >= 1) {
      // Snap to final rotation
      engine.animationProgress = 1;

      // Finalize
      result = completeRoll(engine);
    } else {
      // Animate rotation around pivot
      const angleThisFrame =
        (clampedDt / engine.animationDuration) * engine.pivotTarget;
      engine.pivot.rotateOnAxis(engine.pivotAxis, angleThisFrame);
    }
  }

  // Render
  engine.renderer.render(engine.scene, engine.camera);

  return result;
}

// ---------------------------------------------------------------------------
// Resize
// ---------------------------------------------------------------------------
export function resizeEngine(
  engine: CubeRollEngine,
  w: number,
  h: number
): void {
  engine.camera.aspect = w / h;
  engine.camera.updateProjectionMatrix();
  engine.renderer.setSize(w, h);
}

// ---------------------------------------------------------------------------
// Dispose
// ---------------------------------------------------------------------------
export function disposeEngine(engine: CubeRollEngine): void {
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
  });
}
