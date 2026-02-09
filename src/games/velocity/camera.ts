import * as THREE from "three";

export interface FollowCameraState {
  currentPosition: THREE.Vector3;
  currentLookAt: THREE.Vector3;
  currentFov: number;
}

const BASE_OFFSET = new THREE.Vector3(0, 3, -8);
const LOOK_AHEAD = new THREE.Vector3(0, 1, 6);
const BASE_FOV = 75;
const MAX_FOV = 90;
const POSITION_LERP = 4; // Higher = snappier
const LOOK_LERP = 6;
const FOV_LERP = 3;
const DRIFT_LATERAL_OFFSET = 2;

export function createFollowCameraState(): FollowCameraState {
  return {
    currentPosition: new THREE.Vector3(0, 5, -10),
    currentLookAt: new THREE.Vector3(0, 0, 0),
    currentFov: BASE_FOV,
  };
}

export function updateFollowCamera(
  camera: THREE.PerspectiveCamera,
  target: THREE.Object3D,
  state: FollowCameraState,
  speed: number, // 0-200 display speed
  driftActive: boolean,
  steerDirection: number, // -1 left, 0 none, 1 right
  dt: number
): void {
  // Compute target camera position in world space
  const offset = BASE_OFFSET.clone();

  // Drift lateral offset
  if (driftActive && steerDirection !== 0) {
    offset.x += DRIFT_LATERAL_OFFSET * -steerDirection;
  }

  // Transform offset to world space relative to target
  const targetWorldPos = new THREE.Vector3();
  target.getWorldPosition(targetWorldPos);

  const targetQuaternion = new THREE.Quaternion();
  target.getWorldQuaternion(targetQuaternion);

  const desiredPosition = offset.clone().applyQuaternion(targetQuaternion).add(targetWorldPos);

  // Compute look-at target (slightly ahead of car)
  const desiredLookAt = LOOK_AHEAD.clone()
    .applyQuaternion(targetQuaternion)
    .add(targetWorldPos);

  // Dynamic FOV based on speed
  const speedFraction = Math.min(speed / 200, 1);
  const desiredFov = BASE_FOV + (MAX_FOV - BASE_FOV) * speedFraction;

  // Smooth lerp
  const posLerp = 1 - Math.exp(-POSITION_LERP * dt);
  const lookLerp = 1 - Math.exp(-LOOK_LERP * dt);
  const fovLerp = 1 - Math.exp(-FOV_LERP * dt);

  state.currentPosition.lerp(desiredPosition, posLerp);
  state.currentLookAt.lerp(desiredLookAt, lookLerp);
  state.currentFov += (desiredFov - state.currentFov) * fovLerp;

  // Apply to camera
  camera.position.copy(state.currentPosition);
  camera.lookAt(state.currentLookAt);
  camera.fov = state.currentFov;
  camera.updateProjectionMatrix();
}
