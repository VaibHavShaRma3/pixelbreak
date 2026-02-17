import * as THREE from "three";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface HanoiEngine {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  pegs: THREE.Mesh[]; // 3 peg cylinders
  disks: THREE.Mesh[][]; // disks on each peg (array of 3 arrays)
  diskColors: string[];
  numDisks: number;
  selectedPeg: number | null;
  animatingDisk: THREE.Mesh | null;
  animationPhase: "up" | "across" | "down" | null;
  animTarget: THREE.Vector3;
  animFromPeg: number;
  animToPeg: number;
  animSpeed: number;
  disposed: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PEG_SPACING = 3.5;
const PEG_HEIGHT = 3.5;
const PEG_RADIUS = 0.08;
const PEG_COLOR = 0xca8a04;

const BASE_WIDTH = 12;
const BASE_DEPTH = 3.5;
const BASE_HEIGHT = 0.3;

const DISK_HEIGHT = 0.35;
const MAX_DISK_RADIUS = 1.3;
const MIN_DISK_RADIUS = 0.45;

const LIFT_Y = PEG_HEIGHT + 1.2;
const ANIM_SPEED = 8; // units per second

const NEON_PALETTE = [
  "#00e5ff", // cyan
  "#ff4081", // pink
  "#b388ff", // purple
  "#69f0ae", // green
  "#ffd740", // gold
  "#ff6e40", // orange
  "#18ffff", // aqua
  "#ea80fc", // magenta
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function pegX(index: number): number {
  return (index - 1) * PEG_SPACING; // pegs at -3.5, 0, 3.5
}

function diskY(stackIndex: number): number {
  return BASE_HEIGHT / 2 + DISK_HEIGHT / 2 + stackIndex * DISK_HEIGHT;
}

function diskRadiusForIndex(diskIndex: number, numDisks: number): number {
  // diskIndex 0 = largest, numDisks-1 = smallest
  const t = numDisks === 1 ? 0 : diskIndex / (numDisks - 1);
  return MAX_DISK_RADIUS - t * (MAX_DISK_RADIUS - MIN_DISK_RADIUS);
}

function createDiskMesh(
  radius: number,
  colorHex: string,
): THREE.Mesh {
  const geo = new THREE.CylinderGeometry(radius, radius, DISK_HEIGHT, 32);
  const color = new THREE.Color(colorHex);
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.35,
    metalness: 0.3,
    roughness: 0.4,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

/* ------------------------------------------------------------------ */
/*  getDiskSize — encoded in userData so we can compare                */
/* ------------------------------------------------------------------ */

function setDiskSize(mesh: THREE.Mesh, size: number) {
  mesh.userData.diskSize = size; // lower = larger
}

function getDiskSize(mesh: THREE.Mesh): number {
  return mesh.userData.diskSize as number;
}

/* ------------------------------------------------------------------ */
/*  initEngine                                                         */
/* ------------------------------------------------------------------ */

export function initEngine(
  container: HTMLDivElement,
  numDisks: number,
): HanoiEngine {
  const width = container.clientWidth || 800;
  const height = container.clientHeight || 500;

  // --- Renderer ---
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

  // --- Scene ---
  const scene = new THREE.Scene();

  // --- Lights ---
  const ambient = new THREE.AmbientLight(0x404060, 1.2);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 0.9);
  directional.position.set(5, 10, 7);
  directional.castShadow = true;
  directional.shadow.mapSize.set(1024, 1024);
  scene.add(directional);

  const pointLight1 = new THREE.PointLight(0x00e5ff, 0.6, 20);
  pointLight1.position.set(-4, 5, 3);
  scene.add(pointLight1);

  const pointLight2 = new THREE.PointLight(0xff4081, 0.6, 20);
  pointLight2.position.set(4, 5, 3);
  scene.add(pointLight2);

  // --- Camera ---
  const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
  camera.position.set(0, 5.5, 9);
  camera.lookAt(0, 1.5, 0);

  // --- Base platform ---
  const baseGeo = new THREE.BoxGeometry(BASE_WIDTH, BASE_HEIGHT, BASE_DEPTH);
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    metalness: 0.5,
    roughness: 0.3,
  });
  const baseMesh = new THREE.Mesh(baseGeo, baseMat);
  baseMesh.position.y = 0;
  baseMesh.receiveShadow = true;
  scene.add(baseMesh);

  // --- Pegs ---
  const pegs: THREE.Mesh[] = [];
  for (let i = 0; i < 3; i++) {
    const pegGeo = new THREE.CylinderGeometry(
      PEG_RADIUS,
      PEG_RADIUS,
      PEG_HEIGHT,
      16,
    );
    const pegMat = new THREE.MeshStandardMaterial({
      color: PEG_COLOR,
      emissive: new THREE.Color(PEG_COLOR),
      emissiveIntensity: 0.15,
      metalness: 0.6,
      roughness: 0.3,
    });
    const peg = new THREE.Mesh(pegGeo, pegMat);
    peg.position.set(pegX(i), BASE_HEIGHT / 2 + PEG_HEIGHT / 2, 0);
    peg.castShadow = true;
    peg.userData.pegIndex = i;
    scene.add(peg);
    pegs.push(peg);
  }

  // --- Disks (all start on peg 0) ---
  // Array order: index 0 = bottom (largest), last = top (smallest).
  // Pop always removes the top (smallest) disk.
  const diskColors: string[] = [];
  const disks: THREE.Mesh[][] = [[], [], []];

  for (let d = 0; d < numDisks; d++) {
    const colorHex = NEON_PALETTE[d % NEON_PALETTE.length];
    diskColors.push(colorHex);
    const radius = diskRadiusForIndex(d, numDisks);
    const disk = createDiskMesh(radius, colorHex);
    setDiskSize(disk, d); // 0 = largest

    // d=0 (largest) at stackIndex 0 (bottom), d=numDisks-1 (smallest) at top
    disk.position.set(pegX(0), diskY(d), 0);
    scene.add(disk);
    disks[0].push(disk);
  }

  const engine: HanoiEngine = {
    scene,
    camera,
    renderer,
    pegs,
    disks,
    diskColors,
    numDisks,
    selectedPeg: null,
    animatingDisk: null,
    animationPhase: null,
    animTarget: new THREE.Vector3(),
    animFromPeg: -1,
    animToPeg: -1,
    animSpeed: ANIM_SPEED,
    disposed: false,
  };

  // Initial render
  renderer.render(scene, camera);

  return engine;
}

/* ------------------------------------------------------------------ */
/*  selectPeg — handles pick-up and place-down logic                  */
/* ------------------------------------------------------------------ */

export function selectPeg(
  engine: HanoiEngine,
  pegIndex: number,
): { moved: boolean; error?: string } {
  // Block interaction while animation is actively running (not just hovering)
  if (engine.animatingDisk && engine.animationPhase !== null) {
    return { moved: false, error: "Animation in progress" };
  }

  if (pegIndex < 0 || pegIndex > 2) {
    return { moved: false, error: "Invalid peg" };
  }

  // --- First click: select source peg ---
  if (engine.selectedPeg === null) {
    const stack = engine.disks[pegIndex];
    if (stack.length === 0) {
      return { moved: false, error: "No disks on this peg" };
    }

    engine.selectedPeg = pegIndex;

    // Highlight top disk: lift it up (start animation "up")
    const topDisk = stack[stack.length - 1];
    engine.animatingDisk = topDisk;
    engine.animFromPeg = pegIndex;
    engine.animToPeg = pegIndex; // will be updated on second click
    engine.animationPhase = "up";
    engine.animTarget = new THREE.Vector3(pegX(pegIndex), LIFT_Y, 0);

    // Increase emissive for selection glow
    const mat = topDisk.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.8;

    return { moved: false };
  }

  // --- Second click: place disk on target peg ---
  const fromPeg = engine.selectedPeg;
  const toPeg = pegIndex;

  // Clicking the same peg — put the disk back down
  if (fromPeg === toPeg) {
    engine.animToPeg = fromPeg;
    const stackHeight = engine.disks[fromPeg].length - 1; // disk is still in the array
    engine.animTarget = new THREE.Vector3(
      pegX(fromPeg),
      diskY(stackHeight),
      0,
    );
    engine.animationPhase = "down";
    engine.selectedPeg = null;

    // Reduce emissive
    const mat = engine.animatingDisk!.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.35;

    return { moved: false };
  }

  // Validate move: can't place larger on smaller
  const sourceStack = engine.disks[fromPeg];
  const targetStack = engine.disks[toPeg];
  const movingDisk = sourceStack[sourceStack.length - 1];

  if (targetStack.length > 0) {
    const topTarget = targetStack[targetStack.length - 1];
    if (getDiskSize(movingDisk) < getDiskSize(topTarget)) {
      // movingDisk has smaller size number = larger disk
      // Can't place larger disk on smaller disk
      // Put it back
      engine.animToPeg = fromPeg;
      const stackHeight = sourceStack.length - 1;
      engine.animTarget = new THREE.Vector3(
        pegX(fromPeg),
        diskY(stackHeight),
        0,
      );
      engine.animationPhase = "down";
      engine.selectedPeg = null;

      const mat = engine.animatingDisk!.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.35;

      return { moved: false, error: "Cannot place larger disk on smaller disk" };
    }
  }

  // Valid move — animate across then down
  engine.animToPeg = toPeg;

  // First move horizontally to above target peg
  engine.animTarget = new THREE.Vector3(pegX(toPeg), LIFT_Y, 0);
  engine.animationPhase = "across";
  engine.selectedPeg = null;

  // Actually transfer the disk between stacks now
  sourceStack.pop();
  targetStack.push(movingDisk);

  return { moved: true };
}

/* ------------------------------------------------------------------ */
/*  isComplete                                                         */
/* ------------------------------------------------------------------ */

export function isComplete(engine: HanoiEngine): boolean {
  return engine.disks[2].length === engine.numDisks;
}

/* ------------------------------------------------------------------ */
/*  updateEngine — animation tick                                      */
/* ------------------------------------------------------------------ */

export function updateEngine(engine: HanoiEngine, dt: number): void {
  if (engine.disposed) return;

  // Animate disk movement
  if (engine.animatingDisk && engine.animationPhase) {
    const disk = engine.animatingDisk;
    const target = engine.animTarget;
    const speed = engine.animSpeed;
    const step = speed * dt;

    const pos = disk.position;

    if (engine.animationPhase === "up") {
      // Move straight up
      pos.y = Math.min(pos.y + step * 2, target.y);
      if (Math.abs(pos.y - target.y) < 0.01) {
        pos.y = target.y;
        // If this was just a selection lift (no target peg set yet), stop here
        // The disk hovers until the second click
        engine.animationPhase = null;
        // Keep animatingDisk set so we know a disk is "held"
      }
    } else if (engine.animationPhase === "across") {
      // Move horizontally
      const targetX = target.x;
      const diff = targetX - pos.x;
      if (Math.abs(diff) < 0.01) {
        pos.x = targetX;
        // Now drop down
        const toPeg = engine.animToPeg;
        const stackHeight = engine.disks[toPeg].length - 1; // disk already added
        engine.animTarget = new THREE.Vector3(
          pegX(toPeg),
          diskY(stackHeight),
          0,
        );
        engine.animationPhase = "down";
      } else {
        pos.x += Math.sign(diff) * Math.min(step * 1.5, Math.abs(diff));
      }
    } else if (engine.animationPhase === "down") {
      // Move straight down
      const targetY = target.y;
      pos.y = Math.max(pos.y - step * 2, targetY);
      if (Math.abs(pos.y - targetY) < 0.01) {
        pos.y = targetY;
        // Animation complete
        const mat = disk.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = 0.35;
        engine.animatingDisk = null;
        engine.animationPhase = null;
      }
    }
  }

  // Subtle peg glow pulsation
  const time = performance.now() * 0.001;
  for (const peg of engine.pegs) {
    const mat = peg.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = 0.15 + Math.sin(time * 2) * 0.05;
  }

  // Render
  engine.renderer.render(engine.scene, engine.camera);
}

/* ------------------------------------------------------------------ */
/*  resizeEngine                                                       */
/* ------------------------------------------------------------------ */

export function resizeEngine(
  engine: HanoiEngine,
  width: number,
  height: number,
): void {
  engine.camera.aspect = width / height;
  engine.camera.updateProjectionMatrix();
  engine.renderer.setSize(width, height);
}

/* ------------------------------------------------------------------ */
/*  disposeEngine                                                      */
/* ------------------------------------------------------------------ */

export function disposeEngine(engine: HanoiEngine): void {
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
