import * as THREE from "three";
import { type SokobanLevel } from "./levels";

export interface SokobanEngine {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  grid: number[][]; // mutable copy of current level grid
  rows: number;
  cols: number;
  playerPos: { x: number; z: number };
  playerMesh: THREE.Mesh;
  crateMeshes: Map<string, THREE.Mesh>; // key: "x,z"
  goalPositions: { x: number; z: number }[];
  goalMeshes: THREE.Mesh[];
  isAnimating: boolean;
  animProgress: number;
  animDir: { dx: number; dz: number };
  animPlayerStart: THREE.Vector3;
  animCrate: THREE.Mesh | null;
  animCrateStart: THREE.Vector3 | null;
  disposed: boolean;
}

const CELL_SIZE = 1;
const ANIM_DURATION = 0.15; // seconds

// Colors
const COLOR_WALL = 0x3a3a4a;
const COLOR_FLOOR = 0x5a5a6a;
const COLOR_GOAL = 0x22c55e;
const COLOR_CRATE = 0x16a34a;
const COLOR_CRATE_ON_GOAL = 0x4ade80;
const COLOR_PLAYER = 0xeab308;
const COLOR_BG = 0x0a0a1a;

function crateKey(x: number, z: number): string {
  return `${x},${z}`;
}

function deepCopyGrid(grid: number[][]): number[][] {
  return grid.map((row) => [...row]);
}

export function initEngine(
  container: HTMLDivElement,
  level: SokobanLevel
): SokobanEngine {
  const width = container.clientWidth || container.offsetWidth || 800;
  const height = container.clientHeight || container.offsetHeight || 500;

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(width, height);
  renderer.setClearColor(COLOR_BG);
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  container.appendChild(renderer.domElement);

  // Scene
  const scene = new THREE.Scene();

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 0.8);
  directional.position.set(5, 10, 5);
  scene.add(directional);

  // Parse level
  const grid = deepCopyGrid(level.grid);
  const rows = grid.length;
  const cols = grid[0].length;

  // Center offset so the grid is centered at origin
  const offsetX = -(cols - 1) / 2;
  const offsetZ = -(rows - 1) / 2;

  // Camera: isometric top-down
  const maxDim = Math.max(rows, cols);
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  const camDist = maxDim * 1.1;
  camera.position.set(camDist * 0.5, camDist * 1.0, camDist * 0.5);
  camera.lookAt(0, 0, 0);

  // Shared geometries and materials
  const wallGeo = new THREE.BoxGeometry(CELL_SIZE, CELL_SIZE, CELL_SIZE);
  const wallMat = new THREE.MeshStandardMaterial({ color: COLOR_WALL });

  const floorGeo = new THREE.BoxGeometry(CELL_SIZE, 0.05, CELL_SIZE);
  const floorMat = new THREE.MeshStandardMaterial({ color: COLOR_FLOOR });

  const goalGeo = new THREE.BoxGeometry(CELL_SIZE, 0.06, CELL_SIZE);
  const goalMat = new THREE.MeshStandardMaterial({
    color: COLOR_GOAL,
    emissive: COLOR_GOAL,
    emissiveIntensity: 0.4,
  });

  const crateGeo = new THREE.BoxGeometry(
    CELL_SIZE * 0.8,
    CELL_SIZE * 0.8,
    CELL_SIZE * 0.8
  );
  const crateMat = new THREE.MeshStandardMaterial({ color: COLOR_CRATE });
  const crateOnGoalMat = new THREE.MeshStandardMaterial({
    color: COLOR_CRATE_ON_GOAL,
    emissive: COLOR_CRATE_ON_GOAL,
    emissiveIntensity: 0.3,
  });

  const playerGeo = new THREE.SphereGeometry(CELL_SIZE * 0.35, 16, 16);
  const playerMat = new THREE.MeshStandardMaterial({ color: COLOR_PLAYER });

  let playerPos = { x: 0, z: 0 };
  let playerMesh: THREE.Mesh = new THREE.Mesh(playerGeo, playerMat);
  const crateMeshes = new Map<string, THREE.Mesh>();
  const goalPositions: { x: number; z: number }[] = [];
  const goalMeshes: THREE.Mesh[] = [];

  // Build scene from grid
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = grid[row][col];
      const worldX = col * CELL_SIZE + offsetX;
      const worldZ = row * CELL_SIZE + offsetZ;

      if (cell === 0) continue; // empty

      if (cell === 1) {
        // Wall
        const wall = new THREE.Mesh(wallGeo, wallMat);
        wall.position.set(worldX, CELL_SIZE / 2, worldZ);
        scene.add(wall);
      } else {
        // Any walkable cell gets a floor tile
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.position.set(worldX, 0, worldZ);
        scene.add(floor);

        if (cell === 3 || cell === 6) {
          // Goal
          const goal = new THREE.Mesh(goalGeo, goalMat);
          goal.position.set(worldX, 0.01, worldZ);
          scene.add(goal);
          goalPositions.push({ x: col, z: row });
          goalMeshes.push(goal);
        }

        if (cell === 4 || cell === 6) {
          // Crate
          const isOnGoal = cell === 6;
          const crate = new THREE.Mesh(
            crateGeo,
            isOnGoal ? crateOnGoalMat.clone() : crateMat.clone()
          );
          crate.position.set(worldX, CELL_SIZE * 0.4, worldZ);
          scene.add(crate);
          crateMeshes.set(crateKey(col, row), crate);
        }

        if (cell === 5) {
          // Player
          playerPos = { x: col, z: row };
          playerMesh = new THREE.Mesh(playerGeo, playerMat);
          playerMesh.position.set(worldX, CELL_SIZE * 0.35, worldZ);
          scene.add(playerMesh);
        }
      }
    }
  }

  const engine: SokobanEngine = {
    scene,
    camera,
    renderer,
    grid,
    rows,
    cols,
    playerPos,
    playerMesh,
    crateMeshes,
    goalPositions,
    goalMeshes,
    isAnimating: false,
    animProgress: 0,
    animDir: { dx: 0, dz: 0 },
    animPlayerStart: new THREE.Vector3(),
    animCrate: null,
    animCrateStart: null,
    disposed: false,
  };

  // Initial render
  renderer.render(scene, camera);

  return engine;
}

function gridToWorld(
  col: number,
  row: number,
  totalCols: number,
  totalRows: number
): { x: number; z: number } {
  const offsetX = -(totalCols - 1) / 2;
  const offsetZ = -(totalRows - 1) / 2;
  return {
    x: col * CELL_SIZE + offsetX,
    z: row * CELL_SIZE + offsetZ,
  };
}

function isWalkable(cell: number): boolean {
  return cell === 2 || cell === 3 || cell === 5;
}

function isCrate(cell: number): boolean {
  return cell === 4 || cell === 6;
}

export function tryMove(
  engine: SokobanEngine,
  dx: number,
  dz: number
): boolean {
  if (engine.isAnimating || engine.disposed) return false;

  const { playerPos, grid, rows, cols, crateMeshes } = engine;
  const newX = playerPos.x + dx;
  const newZ = playerPos.z + dz;

  // Bounds check
  if (newX < 0 || newX >= cols || newZ < 0 || newZ >= rows) return false;

  const targetCell = grid[newZ][newX];

  // Wall check
  if (targetCell === 1 || targetCell === 0) return false;

  let pushingCrate = false;

  if (isCrate(targetCell)) {
    // Check behind the crate
    const behindX = newX + dx;
    const behindZ = newZ + dz;

    // Bounds check for space behind crate
    if (behindX < 0 || behindX >= cols || behindZ < 0 || behindZ >= rows)
      return false;

    const behindCell = grid[behindZ][behindX];

    // Can't push into wall, empty, or another crate
    if (!isWalkable(behindCell)) return false;

    pushingCrate = true;

    // Update grid for crate movement
    const oldCrateKey = crateKey(newX, newZ);
    const newCrateKey = crateKey(behindX, behindZ);

    // Is the destination a goal?
    const isGoal = engine.goalPositions.some(
      (g) => g.x === behindX && g.z === behindZ
    );
    // Was the crate on a goal?
    const wasOnGoal = targetCell === 6;

    // Update grid: crate's old position
    grid[newZ][newX] = wasOnGoal ? 3 : 2;
    // Update grid: crate's new position
    grid[behindZ][behindX] = isGoal ? 6 : 4;

    // Move crate mesh
    const crateMesh = crateMeshes.get(oldCrateKey);
    if (crateMesh) {
      crateMeshes.delete(oldCrateKey);
      crateMeshes.set(newCrateKey, crateMesh);

      // Update crate color based on goal status
      const mat = crateMesh.material as THREE.MeshStandardMaterial;
      if (isGoal) {
        mat.color.setHex(COLOR_CRATE_ON_GOAL);
        mat.emissive.setHex(COLOR_CRATE_ON_GOAL);
        mat.emissiveIntensity = 0.3;
      } else {
        mat.color.setHex(COLOR_CRATE);
        mat.emissive.setHex(0x000000);
        mat.emissiveIntensity = 0;
      }

      // Set up animation for crate
      engine.animCrate = crateMesh;
      engine.animCrateStart = crateMesh.position.clone();
    }
  }

  // Update grid for player movement
  const wasPlayerOnGoal = engine.goalPositions.some(
    (g) => g.x === playerPos.x && g.z === playerPos.z
  );
  grid[playerPos.z][playerPos.x] = wasPlayerOnGoal ? 3 : 2;

  // Player occupies the new cell (regardless of push or walk)
  grid[newZ][newX] = 5;

  // Start animation
  engine.isAnimating = true;
  engine.animProgress = 0;
  engine.animDir = { dx, dz };
  engine.animPlayerStart = engine.playerMesh.position.clone();

  // Update logical player position
  playerPos.x = newX;
  playerPos.z = newZ;

  return true;
}

export function isLevelComplete(engine: SokobanEngine): boolean {
  const { grid, goalPositions } = engine;
  return goalPositions.every((g) => {
    const cell = grid[g.z][g.x];
    return cell === 6;
  });
}

export function updateEngine(engine: SokobanEngine, dt: number): void {
  if (engine.disposed) return;

  // Handle animation
  if (engine.isAnimating) {
    engine.animProgress += dt / ANIM_DURATION;

    if (engine.animProgress >= 1) {
      engine.animProgress = 1;
      engine.isAnimating = false;
    }

    const t = smoothstep(engine.animProgress);

    // Animate player
    const playerTarget = gridToWorld(
      engine.playerPos.x,
      engine.playerPos.z,
      engine.cols,
      engine.rows
    );
    engine.playerMesh.position.set(
      engine.animPlayerStart.x +
        (playerTarget.x - engine.animPlayerStart.x) * t,
      engine.playerMesh.position.y,
      engine.animPlayerStart.z +
        (playerTarget.z - engine.animPlayerStart.z) * t
    );

    // Animate crate if pushing
    if (engine.animCrate && engine.animCrateStart) {
      const crateTargetCol =
        engine.playerPos.x + engine.animDir.dx;
      const crateTargetRow =
        engine.playerPos.z + engine.animDir.dz;

      // Only animate if a crate was actually pushed (check if crateTargetCol/Row is valid)
      // The crate's final position is already set in the grid, we need to figure it out from the map
      const crateWorldTarget = gridToWorld(
        crateTargetCol,
        crateTargetRow,
        engine.cols,
        engine.rows
      );

      engine.animCrate.position.set(
        engine.animCrateStart.x +
          (crateWorldTarget.x - engine.animCrateStart.x) * t,
        engine.animCrate.position.y,
        engine.animCrateStart.z +
          (crateWorldTarget.z - engine.animCrateStart.z) * t
      );

      if (!engine.isAnimating) {
        engine.animCrate = null;
        engine.animCrateStart = null;
      }
    }
  }

  // Render
  engine.renderer.render(engine.scene, engine.camera);
}

function smoothstep(t: number): number {
  return t * t * (3 - 2 * t);
}

export function resizeEngine(
  engine: SokobanEngine,
  width: number,
  height: number
): void {
  engine.camera.aspect = width / height;
  engine.camera.updateProjectionMatrix();
  engine.renderer.setSize(width, height);
}

export function disposeEngine(engine: SokobanEngine): void {
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
