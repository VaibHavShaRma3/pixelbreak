import * as THREE from "three";
import * as CANNON from "cannon-es";
import { createTrack, getTrackProgress, ROAD_WIDTH, type TrackData } from "./track";
import {
  createPhysicsWorld,
  applyHoverForce,
  syncMeshToBody,
  type PhysicsWorld,
} from "./physics";
import {
  createVehicleMesh,
  updateVehicle,
  applyBoostPad,
  type VehicleInput,
  type VehicleMesh,
  type DriftState,
} from "./vehicle";
import {
  createFollowCameraState,
  updateFollowCamera,
  type FollowCameraState,
} from "./camera";
import {
  createAIRacers,
  updateAIRacers,
  calculatePositions,
  type AIRacer,
} from "./ai";
import { useVelocityStore } from "./store";

export interface VelocityEngine {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  track: TrackData;
  physics: PhysicsWorld;
  playerMesh: VehicleMesh;
  playerDrift: DriftState;
  cameraState: FollowCameraState;
  aiRacers: AIRacer[];
  input: VehicleInput;
  playerLap: number;
  playerCheckpointsHit: boolean[];
  playerProgress: number;
  lastCheckpointT: number;
  raceTimer: number;
  lapTimer: number;
  countdownTimer: number;
  disposed: boolean;
}

export function initEngine(container: HTMLDivElement): VelocityEngine {
  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = false;
  renderer.setClearColor(0x050510);
  container.appendChild(renderer.domElement);

  // Scene
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x050510, 0.008);

  // Lighting
  const ambient = new THREE.AmbientLight(0x404060, 1);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffffff, 0.5);
  directional.position.set(50, 100, 50);
  scene.add(directional);

  // Camera
  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    500
  );

  // Track
  const track = createTrack();
  scene.add(track.trackGroup);

  // Physics
  const physics = createPhysicsWorld();

  // Player vehicle
  const playerMesh = createVehicleMesh(0);
  scene.add(playerMesh.group);

  // Place player at start position
  const startPos = track.curve.getPointAt(0);
  const startTangent = track.curve.getTangentAt(0);
  physics.playerBody.position.set(startPos.x, 1, startPos.z);
  const startAngle = Math.atan2(startTangent.x, startTangent.z);
  physics.playerBody.quaternion.setFromEuler(0, startAngle, 0);

  // AI racers
  const aiRacers = createAIRacers(
    physics.world,
    physics.aiBodies,
    track.curve
  );
  aiRacers.forEach((r) => scene.add(r.mesh.group));

  const cameraState = createFollowCameraState();

  const engine: VelocityEngine = {
    scene,
    camera,
    renderer,
    track,
    physics,
    playerMesh,
    playerDrift: { active: false, charge: 0, boostTimer: 0 },
    cameraState,
    aiRacers,
    input: {
      forward: false,
      backward: false,
      left: false,
      right: false,
      drift: false,
    },
    playerLap: 1,
    playerCheckpointsHit: [false, false, false, false],
    playerProgress: 0,
    lastCheckpointT: 0,
    raceTimer: 0,
    lapTimer: 0,
    countdownTimer: 3,
    disposed: false,
  };

  return engine;
}

export function startCountdown(engine: VelocityEngine, onCountdownEnd: () => void) {
  const store = useVelocityStore.getState();
  store.setRaceState("countdown");
  store.setCountdown(3);

  engine.countdownTimer = 3;

  let elapsed = 0;
  let lastCount = 3;

  const interval = setInterval(() => {
    elapsed += 0.05;
    const remaining = Math.max(0, 3 - elapsed);
    engine.countdownTimer = remaining;

    const count = Math.ceil(remaining);
    if (count !== lastCount) {
      lastCount = count;
      store.setCountdown(count);
    }

    if (remaining <= 0) {
      clearInterval(interval);
      store.setCountdown(0);
      store.setRaceState("racing");
      onCountdownEnd();
    }
  }, 50);

  return interval;
}

export function updateEngine(engine: VelocityEngine, dt: number): void {
  if (engine.disposed) return;

  const store = useVelocityStore.getState();
  const raceState = store.raceState;

  // Clamp dt to prevent physics explosions
  const clampedDt = Math.min(dt, 0.05);

  // Step physics
  engine.physics.world.step(1 / 60, clampedDt, 3);

  if (raceState === "racing") {
    // Update race timers
    engine.raceTimer += clampedDt * 1000;
    engine.lapTimer += clampedDt * 1000;
    store.setTotalRaceTime(engine.raceTimer);
    store.setCurrentLapTime(engine.lapTimer);

    // Player hover
    applyHoverForce(engine.physics.playerBody, engine.physics.world);

    // Player vehicle update
    const result = updateVehicle(
      clampedDt,
      engine.input,
      engine.physics.playerBody,
      engine.playerDrift
    );
    engine.playerDrift = result.drift;
    store.setSpeed(result.speed);
    store.setDrift(result.drift.active, result.drift.charge);

    // Check boost pads
    const playerPos = new THREE.Vector3(
      engine.physics.playerBody.position.x,
      engine.physics.playerBody.position.y,
      engine.physics.playerBody.position.z
    );

    for (const pad of engine.track.boostPads) {
      const dist = playerPos.distanceTo(pad.position);
      if (dist < ROAD_WIDTH * 0.4) {
        applyBoostPad(engine.physics.playerBody);
      }
    }

    // Track progress & checkpoints
    const prevT = engine.playerProgress - Math.floor(engine.playerProgress);
    const currentT = getTrackProgress(engine.track.curve, playerPos);

    // Check checkpoint hits
    for (let i = 0; i < engine.track.checkpoints.length; i++) {
      const cpDist = playerPos.distanceTo(engine.track.checkpoints[i]);
      if (cpDist < ROAD_WIDTH) {
        engine.playerCheckpointsHit[i] = true;
      }
    }

    // Detect lap completion
    if (prevT > 0.8 && currentT < 0.2) {
      // Crossed start/finish line
      const allCheckpoints = engine.playerCheckpointsHit.every((c) => c);
      if (allCheckpoints) {
        // Lap complete
        store.addLapTime(engine.lapTimer);
        engine.lapTimer = 0;
        engine.playerLap++;

        if (engine.playerLap > store.totalLaps) {
          // Race finished
          store.setRaceState("finished");
          store.setLap(store.totalLaps);
          return;
        }

        store.setLap(engine.playerLap);
        engine.playerCheckpointsHit = [false, false, false, false];
      }
    }

    engine.playerProgress = (engine.playerLap - 1) + currentT;

    // AI update
    updateAIRacers(
      engine.aiRacers,
      engine.track.curve,
      engine.playerProgress,
      store.totalLaps,
      clampedDt
    );

    // Position calculation
    const position = calculatePositions(engine.playerProgress, engine.aiRacers);
    store.setPosition(position);

    // Update racer progress for minimap
    const progress = engine.aiRacers.map((r) => r.totalProgress);
    progress.push(engine.playerProgress);
    store.setRacerProgress(progress);
  }

  // Sync player mesh
  syncMeshToBody(engine.playerMesh.group, engine.physics.playerBody);

  // Update exhaust intensity based on speed
  const speedFraction = store.speed / store.maxSpeed;
  engine.playerMesh.exhaust.intensity = 0.5 + speedFraction * 3;

  // Update camera
  const steerDir = engine.input.left ? -1 : engine.input.right ? 1 : 0;
  updateFollowCamera(
    engine.camera,
    engine.playerMesh.group,
    engine.cameraState,
    store.speed,
    engine.playerDrift.active,
    steerDir,
    clampedDt
  );

  // Render
  engine.renderer.render(engine.scene, engine.camera);
}

export function resizeEngine(engine: VelocityEngine, width: number, height: number) {
  engine.camera.aspect = width / height;
  engine.camera.updateProjectionMatrix();
  engine.renderer.setSize(width, height);
}

export function disposeEngine(engine: VelocityEngine) {
  engine.disposed = true;

  // Remove renderer DOM element
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
