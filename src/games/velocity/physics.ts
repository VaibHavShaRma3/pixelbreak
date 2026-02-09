import * as CANNON from "cannon-es";
import * as THREE from "three";

export interface PhysicsWorld {
  world: CANNON.World;
  groundBody: CANNON.Body;
  playerBody: CANNON.Body;
  aiBodies: CANNON.Body[];
}

export function createPhysicsWorld(): PhysicsWorld {
  const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -30, 0),
  });

  // Broadphase for performance
  world.broadphase = new CANNON.SAPBroadphase(world);
  world.allowSleep = false;

  // Ground plane
  const groundShape = new CANNON.Plane();
  const groundBody = new CANNON.Body({ mass: 0, shape: groundShape });
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(groundBody);

  // Player vehicle body
  const playerBody = createVehicleBody(world);

  // AI bodies
  const aiBodies: CANNON.Body[] = [];
  for (let i = 0; i < 7; i++) {
    aiBodies.push(createVehicleBody(world));
  }

  return { world, groundBody, playerBody, aiBodies };
}

function createVehicleBody(world: CANNON.World): CANNON.Body {
  const shape = new CANNON.Box(new CANNON.Vec3(1, 0.4, 2));
  const body = new CANNON.Body({
    mass: 50,
    shape,
    linearDamping: 0.3,
    angularDamping: 0.8,
  });
  body.position.set(0, 1, 0);
  world.addBody(body);
  return body;
}

/** Apply hover forces — 4 raycasts keep car at target height */
export function applyHoverForce(
  body: CANNON.Body,
  world: CANNON.World,
  targetHeight: number = 0.6
) {
  const hoverPoints = [
    new CANNON.Vec3(-0.8, 0, -1.5),
    new CANNON.Vec3(0.8, 0, -1.5),
    new CANNON.Vec3(-0.8, 0, 1.5),
    new CANNON.Vec3(0.8, 0, 1.5),
  ];

  const downDir = new CANNON.Vec3(0, -1, 0);
  const rayLength = targetHeight * 2;

  for (const localPoint of hoverPoints) {
    // Transform local point to world space
    const worldPoint = body.pointToWorldFrame(localPoint);
    const ray = new CANNON.Ray(worldPoint, new CANNON.Vec3(
      worldPoint.x + downDir.x * rayLength,
      worldPoint.y + downDir.y * rayLength,
      worldPoint.z + downDir.z * rayLength
    ));
    ray.skipBackfaces = true;

    const result = new CANNON.RaycastResult();
    ray.intersectWorld(world, { result, skipBackfaces: true });

    if (result.hasHit && result.distance !== undefined) {
      const distance = result.distance;
      if (distance < rayLength) {
        const compression = 1 - distance / rayLength;
        const forceMagnitude = compression * 400;
        // Damping based on vertical velocity
        const verticalVel = body.velocity.y;
        const dampingForce = -verticalVel * 30;
        body.applyForce(
          new CANNON.Vec3(0, forceMagnitude + dampingForce, 0),
          worldPoint
        );
      }
    }
  }
}

/** Sync a Three.js mesh position/rotation from a Cannon-es body */
export function syncMeshToBody(mesh: THREE.Object3D, body: CANNON.Body) {
  mesh.position.set(body.position.x, body.position.y, body.position.z);
  mesh.quaternion.set(
    body.quaternion.x,
    body.quaternion.y,
    body.quaternion.z,
    body.quaternion.w
  );
}
