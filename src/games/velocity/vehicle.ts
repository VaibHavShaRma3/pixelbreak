import * as THREE from "three";
import * as CANNON from "cannon-es";

export interface VehicleInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  drift: boolean;
}

export interface VehicleMesh {
  group: THREE.Group;
  bodyMesh: THREE.Mesh;
  underglow: THREE.PointLight;
  exhaust: THREE.PointLight;
}

const TEAM_COLORS = [
  0x00fff5, // cyan (player)
  0xff2d95, // pink
  0x39ff14, // green
  0xffe600, // yellow
  0xb026ff, // purple
  0xff6600, // orange
  0x00ff88, // mint
  0xff0044, // red
];

export function createVehicleMesh(teamIndex: number = 0): VehicleMesh {
  const group = new THREE.Group();
  const color = TEAM_COLORS[teamIndex % TEAM_COLORS.length];

  // Main body
  const bodyGeo = new THREE.BoxGeometry(1.8, 0.5, 3.5);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x111122,
    metalness: 0.8,
    roughness: 0.2,
  });
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = 0;
  group.add(bodyMesh);

  // Cockpit
  const cockpitGeo = new THREE.BoxGeometry(1.2, 0.35, 1.2);
  const cockpitMat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.3,
    metalness: 0.9,
    roughness: 0.1,
  });
  const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
  cockpit.position.set(0, 0.35, -0.3);
  group.add(cockpit);

  // Front wing
  const wingGeo = new THREE.BoxGeometry(2.2, 0.1, 0.6);
  const wingMat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.4,
  });
  const frontWing = new THREE.Mesh(wingGeo, wingMat);
  frontWing.position.set(0, -0.1, 1.6);
  group.add(frontWing);

  // Rear wing
  const rearWing = new THREE.Mesh(wingGeo, wingMat.clone());
  rearWing.position.set(0, 0.3, -1.7);
  group.add(rearWing);

  // Neon underglow
  const underglow = new THREE.PointLight(color, 2, 6);
  underglow.position.set(0, -0.3, 0);
  group.add(underglow);

  // Engine exhaust glow
  const exhaust = new THREE.PointLight(0xff4400, 1, 4);
  exhaust.position.set(0, 0, -1.8);
  group.add(exhaust);

  group.castShadow = true;

  return { group, bodyMesh, underglow, exhaust };
}

export interface DriftState {
  active: boolean;
  charge: number; // 0 to 1
  boostTimer: number; // remaining boost time
}

const MAX_SPEED = 60;
const ACCELERATION = 40;
const BRAKE_FORCE = 50;
const STEER_TORQUE = 15;
const DRIFT_CHARGE_RATE = 0.67; // full charge in ~1.5s
const DRIFT_BOOST_DURATION = 0.5;
const DRIFT_BOOST_MULTIPLIER = 1.5;
const REVERSE_SPEED = 15;

export function updateVehicle(
  dt: number,
  input: VehicleInput,
  body: CANNON.Body,
  drift: DriftState
): { speed: number; drift: DriftState } {
  // Get forward direction from body quaternion
  const forward = new CANNON.Vec3(0, 0, 1);
  body.quaternion.vmult(forward, forward);

  // Current speed (projected onto forward)
  const velocity = body.velocity;
  const speed = velocity.dot(forward);
  const absSpeed = Math.abs(speed);

  // --- Acceleration / Braking ---
  if (input.forward && speed < MAX_SPEED) {
    const force = forward.scale(ACCELERATION * body.mass);
    body.applyForce(force);
  }
  if (input.backward) {
    if (speed > 1) {
      // Braking
      const brakeDir = forward.scale(-BRAKE_FORCE * body.mass);
      body.applyForce(brakeDir);
    } else {
      // Reverse
      const reverseForce = forward.scale(-ACCELERATION * 0.4 * body.mass);
      if (Math.abs(speed) < REVERSE_SPEED) {
        body.applyForce(reverseForce);
      }
    }
  }

  // --- Steering ---
  const steerMultiplier = Math.min(absSpeed / 10, 1); // Less steering at low speed
  if (input.left) {
    body.angularVelocity.y += STEER_TORQUE * dt * steerMultiplier;
  }
  if (input.right) {
    body.angularVelocity.y -= STEER_TORQUE * dt * steerMultiplier;
  }

  // Clamp angular velocity
  body.angularVelocity.y = Math.max(-4, Math.min(4, body.angularVelocity.y));

  // --- Drift mechanic ---
  const newDrift = { ...drift };

  if (input.drift && (input.left || input.right) && absSpeed > 10) {
    newDrift.active = true;
    newDrift.charge = Math.min(1, drift.charge + DRIFT_CHARGE_RATE * dt);

    // Reduce grip during drift — allow sideways sliding
    body.linearDamping = 0.1;
    body.angularDamping = 0.5;
  } else {
    if (drift.active && !input.drift) {
      // Released drift — check for boost
      if (drift.charge > 0.5) {
        newDrift.boostTimer = DRIFT_BOOST_DURATION;
      }
      newDrift.active = false;
      newDrift.charge = 0;
    }

    body.linearDamping = 0.3;
    body.angularDamping = 0.8;
  }

  // Apply boost
  if (newDrift.boostTimer > 0) {
    newDrift.boostTimer -= dt;
    const boostForce = forward.scale(
      ACCELERATION * DRIFT_BOOST_MULTIPLIER * body.mass
    );
    body.applyForce(boostForce);
  }

  // Speed cap
  const currentSpeed = body.velocity.length();
  const maxAllowed = newDrift.boostTimer > 0 ? MAX_SPEED * 1.5 : MAX_SPEED;
  if (currentSpeed > maxAllowed) {
    body.velocity.scale(maxAllowed / currentSpeed, body.velocity);
  }

  // Map physics speed to display speed (0-200 HUD range)
  const displaySpeed = (absSpeed / MAX_SPEED) * 200;

  return { speed: displaySpeed, drift: newDrift };
}

export function applyBoostPad(body: CANNON.Body) {
  const forward = new CANNON.Vec3(0, 0, 1);
  body.quaternion.vmult(forward, forward);
  body.velocity.x += forward.x * 20;
  body.velocity.z += forward.z * 20;
}
