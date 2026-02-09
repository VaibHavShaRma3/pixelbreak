import * as THREE from "three";

// Track control points forming a closed loop circuit
const TRACK_POINTS = [
  new THREE.Vector3(0, 0, 0),
  new THREE.Vector3(40, 0, -20),
  new THREE.Vector3(80, 0, -10),
  new THREE.Vector3(100, 0, 20),
  new THREE.Vector3(90, 0, 60),
  new THREE.Vector3(60, 0, 80),
  new THREE.Vector3(20, 0, 70),
  new THREE.Vector3(-10, 0, 50),
  new THREE.Vector3(-30, 0, 30),
  new THREE.Vector3(-20, 0, 10),
];

export const ROAD_WIDTH = 12;
const BORDER_WIDTH = 0.3;
const NUM_CHECKPOINTS = 4;

export interface TrackData {
  curve: THREE.CatmullRomCurve3;
  roadMesh: THREE.Mesh;
  borderMeshes: THREE.Mesh[];
  groundMesh: THREE.Mesh;
  checkpoints: THREE.Vector3[];
  checkpointTangents: THREE.Vector3[];
  boostPads: { position: THREE.Vector3; tangent: THREE.Vector3; t: number }[];
  obstacles: THREE.Mesh[];
  trackGroup: THREE.Group;
}

export function createTrack(): TrackData {
  const trackGroup = new THREE.Group();

  // Create closed-loop spline
  const curve = new THREE.CatmullRomCurve3(TRACK_POINTS, true, "catmullrom", 0.5);
  const numSegments = 400;

  // Generate road surface geometry
  const roadGeometry = createRoadGeometry(curve, numSegments, ROAD_WIDTH);
  const roadMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a1a2e,
    roughness: 0.8,
    metalness: 0.2,
  });
  const roadMesh = new THREE.Mesh(roadGeometry, roadMaterial);
  roadMesh.receiveShadow = true;
  trackGroup.add(roadMesh);

  // Neon border strips
  const borderMeshes = createBorderStrips(curve, numSegments);
  borderMeshes.forEach((b) => trackGroup.add(b));

  // Ground plane with grid shader
  const groundMesh = createGridGround();
  trackGroup.add(groundMesh);

  // Checkpoints
  const checkpoints: THREE.Vector3[] = [];
  const checkpointTangents: THREE.Vector3[] = [];
  for (let i = 0; i < NUM_CHECKPOINTS; i++) {
    const t = i / NUM_CHECKPOINTS;
    checkpoints.push(curve.getPointAt(t));
    checkpointTangents.push(curve.getTangentAt(t));
  }

  // Boost pads
  const boostPadTs = [0.15, 0.4, 0.65, 0.85];
  const boostPads = boostPadTs.map((t) => ({
    position: curve.getPointAt(t),
    tangent: curve.getTangentAt(t),
    t,
  }));
  const boostMeshes = createBoostPads(boostPads);
  boostMeshes.forEach((m) => trackGroup.add(m));

  // Obstacles (pillars and barriers)
  const obstacles = createObstacles(curve);
  obstacles.forEach((o) => trackGroup.add(o));

  return {
    curve,
    roadMesh,
    borderMeshes,
    groundMesh,
    checkpoints,
    checkpointTangents,
    boostPads,
    obstacles,
    trackGroup,
  };
}

function createRoadGeometry(
  curve: THREE.CatmullRomCurve3,
  segments: number,
  width: number
): THREE.BufferGeometry {
  const vertices: number[] = [];
  const indices: number[] = [];
  const uvs: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const normal = new THREE.Vector3()
      .crossVectors(tangent, new THREE.Vector3(0, 1, 0))
      .normalize();

    const halfWidth = width / 2;
    // Left edge
    vertices.push(
      point.x - normal.x * halfWidth,
      point.y + 0.01,
      point.z - normal.z * halfWidth
    );
    // Right edge
    vertices.push(
      point.x + normal.x * halfWidth,
      point.y + 0.01,
      point.z + normal.z * halfWidth
    );

    uvs.push(0, t * 20);
    uvs.push(1, t * 20);

    if (i < segments) {
      const base = i * 2;
      indices.push(base, base + 1, base + 2);
      indices.push(base + 1, base + 3, base + 2);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3)
  );
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function createBorderStrips(
  curve: THREE.CatmullRomCurve3,
  segments: number
): THREE.Mesh[] {
  const meshes: THREE.Mesh[] = [];
  const colors = [0x00fff5, 0xff2d95]; // cyan left, pink right

  for (let side = 0; side < 2; side++) {
    const vertices: number[] = [];
    const indices: number[] = [];

    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t).normalize();
      const normal = new THREE.Vector3()
        .crossVectors(tangent, new THREE.Vector3(0, 1, 0))
        .normalize();

      const sign = side === 0 ? -1 : 1;
      const offset = (ROAD_WIDTH / 2) * sign;
      const borderOuter = offset + BORDER_WIDTH * sign;

      vertices.push(
        point.x + normal.x * offset,
        point.y + 0.05,
        point.z + normal.z * offset
      );
      vertices.push(
        point.x + normal.x * borderOuter,
        point.y + 0.15,
        point.z + normal.z * borderOuter
      );

      if (i < segments) {
        const base = i * 2;
        indices.push(base, base + 1, base + 2);
        indices.push(base + 1, base + 3, base + 2);
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.Float32BufferAttribute(vertices, 3));
    geo.setIndex(indices);
    geo.computeVertexNormals();

    const mat = new THREE.MeshBasicMaterial({
      color: colors[side],
      transparent: true,
      opacity: 0.8,
    });
    const mesh = new THREE.Mesh(geo, mat);
    meshes.push(mesh);
  }

  return meshes;
}

function createGridGround(): THREE.Mesh {
  const gridShader = {
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      void main() {
        vUv = uv;
        vec4 worldPos = modelMatrix * vec4(position, 1.0);
        vWorldPos = worldPos.xyz;
        gl_Position = projectionMatrix * viewMatrix * worldPos;
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      varying vec3 vWorldPos;
      uniform float uTime;

      void main() {
        vec2 grid = abs(fract(vWorldPos.xz * 0.1 - 0.5) - 0.5) / fwidth(vWorldPos.xz * 0.1);
        float line = min(grid.x, grid.y);
        float gridAlpha = 1.0 - min(line, 1.0);

        vec3 baseColor = vec3(0.02, 0.02, 0.06);
        vec3 gridColor = vec3(0.0, 0.4, 0.5);

        float dist = length(vWorldPos.xz) * 0.005;
        float fade = max(0.0, 1.0 - dist);

        vec3 color = mix(baseColor, gridColor, gridAlpha * 0.3 * fade);
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  };

  const groundGeo = new THREE.PlaneGeometry(500, 500);
  groundGeo.rotateX(-Math.PI / 2);
  const groundMat = new THREE.ShaderMaterial({
    vertexShader: gridShader.vertexShader,
    fragmentShader: gridShader.fragmentShader,
    uniforms: {
      uTime: { value: 0 },
    },
  });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.position.y = -0.1;
  return ground;
}

function createBoostPads(
  pads: { position: THREE.Vector3; tangent: THREE.Vector3; t: number }[]
): THREE.Mesh[] {
  return pads.map((pad) => {
    const geo = new THREE.PlaneGeometry(ROAD_WIDTH * 0.6, 4);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x39ff14,
      transparent: true,
      opacity: 0.6,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(pad.position);
    mesh.position.y += 0.05;
    mesh.rotateX(-Math.PI / 2);

    // Align with track direction
    const angle = Math.atan2(pad.tangent.x, pad.tangent.z);
    mesh.rotateZ(-angle);

    mesh.userData.isBoostPad = true;
    return mesh;
  });
}

function createObstacles(curve: THREE.CatmullRomCurve3): THREE.Mesh[] {
  const obstacles: THREE.Mesh[] = [];
  const pillarPositions = [0.25, 0.5, 0.75];

  pillarPositions.forEach((t) => {
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const normal = new THREE.Vector3()
      .crossVectors(tangent, new THREE.Vector3(0, 1, 0))
      .normalize();

    // Pillar offset to one side of the road
    const offset = (Math.random() - 0.5) * ROAD_WIDTH * 0.5;
    const geo = new THREE.CylinderGeometry(0.4, 0.4, 3, 8);
    const mat = new THREE.MeshStandardMaterial({
      color: 0xff2d95,
      emissive: 0xff2d95,
      emissiveIntensity: 0.5,
    });
    const pillar = new THREE.Mesh(geo, mat);
    pillar.position.set(
      point.x + normal.x * offset,
      1.5,
      point.z + normal.z * offset
    );
    pillar.userData.isObstacle = true;
    obstacles.push(pillar);
  });

  return obstacles;
}

/** Find the closest point on the track curve to a world position, returns normalized t (0-1) */
export function getTrackProgress(
  curve: THREE.CatmullRomCurve3,
  position: THREE.Vector3,
  samples: number = 200
): number {
  let minDist = Infinity;
  let bestT = 0;

  for (let i = 0; i < samples; i++) {
    const t = i / samples;
    const point = curve.getPointAt(t);
    const dist = position.distanceTo(point);
    if (dist < minDist) {
      minDist = dist;
      bestT = t;
    }
  }

  return bestT;
}
