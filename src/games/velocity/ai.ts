import * as THREE from "three";
import * as CANNON from "cannon-es";
import { createVehicleMesh, type VehicleMesh } from "./vehicle";
import { syncMeshToBody } from "./physics";

export interface AIRacer {
  mesh: VehicleMesh;
  body: CANNON.Body;
  targetT: number; // current progress along track spline (0-1)
  baseSpeedMultiplier: number; // 0.7-0.95
  currentSpeed: number;
  lapsCompleted: number;
  checkpointsHit: number;
  totalProgress: number; // laps + fractional progress
}

const AI_COUNT = 7;
const AI_BASE_SPEED = 35; // base forward speed in physics units
const RUBBER_BAND_STRENGTH = 0.15;
const STEER_STRENGTH = 8;

export function createAIRacers(
  world: CANNON.World,
  bodies: CANNON.Body[],
  curve: THREE.CatmullRomCurve3
): AIRacer[] {
  const racers: AIRacer[] = [];

  for (let i = 0; i < AI_COUNT; i++) {
    const mesh = createVehicleMesh(i + 1); // team index 1-7

    // Stagger starting positions behind the start line
    const startT = 0.98 - i * 0.01;
    const startPos = curve.getPointAt(startT);
    const startTangent = curve.getTangentAt(startT);

    const body = bodies[i];
    // Offset laterally based on grid position
    const normal = new THREE.Vector3()
      .crossVectors(startTangent, new THREE.Vector3(0, 1, 0))
      .normalize();
    const lateralOffset = ((i % 2) * 2 - 1) * 2.5;

    body.position.set(
      startPos.x + normal.x * lateralOffset,
      1,
      startPos.z + normal.z * lateralOffset
    );

    // Face along track direction
    const angle = Math.atan2(startTangent.x, startTangent.z);
    body.quaternion.setFromEuler(0, angle, 0);

    syncMeshToBody(mesh.group, body);

    racers.push({
      mesh,
      body,
      targetT: startT,
      baseSpeedMultiplier: 0.7 + Math.random() * 0.25, // 0.70 to 0.95
      currentSpeed: 0,
      lapsCompleted: 0,
      checkpointsHit: 0,
      totalProgress: 0,
    });
  }

  return racers;
}

export function updateAIRacers(
  racers: AIRacer[],
  curve: THREE.CatmullRomCurve3,
  playerProgress: number, // player's total progress (laps + fractional)
  totalLaps: number,
  dt: number
): void {
  for (const racer of racers) {
    if (racer.lapsCompleted >= totalLaps) {
      // Finished — slow down
      racer.body.velocity.scale(0.95, racer.body.velocity);
      syncMeshToBody(racer.mesh.group, racer.body);
      continue;
    }

    // Rubber-banding: adjust speed based on distance to player
    const progressDiff = playerProgress - racer.totalProgress;
    let rubberBand = 1;
    if (progressDiff > 0.1) {
      // AI is behind player — speed up
      rubberBand = 1 + RUBBER_BAND_STRENGTH * Math.min(progressDiff, 1);
    } else if (progressDiff < -0.3) {
      // AI is far ahead — slow down slightly
      rubberBand = 1 - RUBBER_BAND_STRENGTH * 0.5;
    }

    const targetSpeed = AI_BASE_SPEED * racer.baseSpeedMultiplier * rubberBand;

    // Advance target position along spline
    const advanceRate = (targetSpeed / curve.getLength()) * dt;
    racer.targetT = (racer.targetT + advanceRate) % 1;

    // Check lap completion
    const prevProgress = racer.totalProgress;
    racer.totalProgress = racer.lapsCompleted + racer.targetT;

    // Detect lap wrap (t goes from ~0.99 to ~0.01)
    const prevFractional = prevProgress - Math.floor(prevProgress);
    if (prevFractional > 0.9 && racer.targetT < 0.1) {
      racer.lapsCompleted++;
      racer.totalProgress = racer.lapsCompleted + racer.targetT;
    }

    // Steer toward target point on track
    const targetPoint = curve.getPointAt(racer.targetT);
    const targetTangent = curve.getTangentAt(racer.targetT);

    // Add slight random lateral offset for natural movement
    const normal = new THREE.Vector3()
      .crossVectors(targetTangent, new THREE.Vector3(0, 1, 0))
      .normalize();
    const lateralOffset = Math.sin(racer.targetT * Math.PI * 8 + racer.baseSpeedMultiplier * 100) * 2;
    targetPoint.add(normal.multiplyScalar(lateralOffset));

    // Direction to target
    const bodyPos = new THREE.Vector3(
      racer.body.position.x,
      racer.body.position.y,
      racer.body.position.z
    );
    const toTarget = targetPoint.clone().sub(bodyPos).normalize();

    // Apply steering force
    const desiredAngle = Math.atan2(toTarget.x, toTarget.z);
    const bodyAngle = getBodyYaw(racer.body);
    let angleDiff = desiredAngle - bodyAngle;

    // Normalize angle diff to -PI..PI
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

    racer.body.angularVelocity.y = angleDiff * STEER_STRENGTH;

    // Apply forward force
    const forward = new CANNON.Vec3(0, 0, 1);
    racer.body.quaternion.vmult(forward, forward);
    const currentSpeed = racer.body.velocity.length();

    if (currentSpeed < targetSpeed) {
      const force = forward.scale(targetSpeed * racer.body.mass * 0.5);
      racer.body.applyForce(force);
    }

    // Speed cap
    if (currentSpeed > targetSpeed * 1.2) {
      racer.body.velocity.scale(targetSpeed / currentSpeed, racer.body.velocity);
    }

    // Hover force (simplified — just keep at height)
    if (racer.body.position.y < 0.6) {
      racer.body.velocity.y = Math.max(racer.body.velocity.y, 2);
    }

    racer.currentSpeed = currentSpeed;
    syncMeshToBody(racer.mesh.group, racer.body);
  }
}

function getBodyYaw(body: CANNON.Body): number {
  const forward = new CANNON.Vec3(0, 0, 1);
  body.quaternion.vmult(forward, forward);
  return Math.atan2(forward.x, forward.z);
}

/** Calculate race positions (1st, 2nd, ...) */
export function calculatePositions(
  playerProgress: number,
  racers: AIRacer[]
): number {
  let position = 1; // Start at 1st place
  for (const racer of racers) {
    if (racer.totalProgress > playerProgress) {
      position++;
    }
  }
  return position;
}
