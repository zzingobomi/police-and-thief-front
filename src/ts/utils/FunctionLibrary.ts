import * as _ from "lodash";
import * as CANNON from "cannon-es";
import * as THREE from "three";
import { Space } from "../enums/Space";
import { SimulationFrame } from "../physics/colliders/spring_simulation/SimulationFrame";
import { StartWalkBackLeft } from "../characters/character_states/StartWalkBackLeft";
import { Character } from "../characters/Character";
import { Idle } from "../characters/character_states/Idle";
import { Walk } from "../characters/character_states/Walk";
import { StartWalkBackRight } from "../characters/character_states/StartWalkBackRight";
import { StartWalkLeft } from "../characters/character_states/StartWalkLeft";
import { StartWalkRight } from "../characters/character_states/StartWalkRight";
import { StartWalkForward } from "../characters/character_states/StartWalkForward";
import { IdleRotateLeft } from "../characters/character_states/IdleRotateLeft";
import { IdleRotateRight } from "../characters/character_states/IdleRotateRight";
import { StateType } from "../enums/StateType";
import { EndWalk } from "../characters/character_states/EndWalk";
import { Falling } from "../characters/character_states/Falling";
import { DropIdle } from "../characters/character_states/DropIdle";
import { DropRolling } from "../characters/character_states/DropRolling";
import { DropRunning } from "../characters/character_states/DropRunning";
import { JumpIdle } from "../characters/character_states/JumpIdle";
import { JumpRunning } from "../characters/character_states/JumpRunning";
import { Sprint } from "../characters/character_states/Sprint";
import { OpenVehicleDoor } from "../characters/character_states/vehicles/OpenVehicleDoor";
import { EnteringVehicle } from "../characters/character_states/vehicles/EnteringVehicle";
import { Driving } from "../characters/character_states/vehicles/Driving";
import { Sitting } from "../characters/character_states/vehicles/Sitting";

interface Face3 {
  a: number;
  b: number;
  c: number;
  normals: THREE.Vector3[];
}

// eslint-disable-next-line @typescript-eslint/ban-types
export function setDefaults(options: {}, defaults: {}): {} {
  return _.defaults({}, _.clone(options), defaults);
}

export function threeVector(vec: CANNON.Vec3): THREE.Vector3 {
  return new THREE.Vector3(vec.x, vec.y, vec.z);
}

export function cannonVector(vec: THREE.Vector3): CANNON.Vec3 {
  return new CANNON.Vec3(vec.x, vec.y, vec.z);
}

export function threeQuat(quat: CANNON.Quaternion): THREE.Quaternion {
  return new THREE.Quaternion(quat.x, quat.y, quat.z, quat.w);
}

export function cannonQuat(quat: THREE.Quaternion): CANNON.Quaternion {
  return new CANNON.Quaternion(quat.x, quat.y, quat.z, quat.w);
}

export function getMatrix(obj: THREE.Object3D, space: Space): THREE.Matrix4 {
  switch (space) {
    case Space.Local:
      return obj.matrix;
    case Space.Global:
      return obj.matrixWorld;
  }
}

export function getRight(
  obj: THREE.Object3D,
  space: Space = Space.Global
): THREE.Vector3 {
  const matrix = getMatrix(obj, space);
  return new THREE.Vector3(
    matrix.elements[0],
    matrix.elements[1],
    matrix.elements[2]
  );
}

export function getUp(
  obj: THREE.Object3D,
  space: Space = Space.Global
): THREE.Vector3 {
  const matrix = getMatrix(obj, space);
  return new THREE.Vector3(
    matrix.elements[4],
    matrix.elements[5],
    matrix.elements[6]
  );
}

export function getForward(
  obj: THREE.Object3D,
  space: Space = Space.Global
): THREE.Vector3 {
  const matrix = getMatrix(obj, space);
  return new THREE.Vector3(
    matrix.elements[8],
    matrix.elements[9],
    matrix.elements[10]
  );
}

export function getBack(
  obj: THREE.Object3D,
  space: Space = Space.Global
): THREE.Vector3 {
  const matrix = getMatrix(obj, space);
  return new THREE.Vector3(
    -matrix.elements[8],
    -matrix.elements[9],
    -matrix.elements[10]
  );
}

export function spring(
  source: number,
  dest: number,
  velocity: number,
  mass: number,
  damping: number
): SimulationFrame {
  let acceleration = dest - source;
  acceleration /= mass;
  velocity += acceleration;
  velocity *= damping;

  const position = source + velocity;

  return new SimulationFrame(position, velocity);
}

export function springV(
  source: THREE.Vector3,
  dest: THREE.Vector3,
  velocity: THREE.Vector3,
  mass: number,
  damping: number
): void {
  const acceleration = new THREE.Vector3().subVectors(dest, source);
  acceleration.divideScalar(mass);
  velocity.add(acceleration);
  velocity.multiplyScalar(damping);
  source.add(velocity);
}

export function getSignedAngleBetweenVectors(
  v1: THREE.Vector3,
  v2: THREE.Vector3,
  normal: THREE.Vector3 = new THREE.Vector3(0, 1, 0),
  dotTreshold: number = 0.0005
): number {
  let angle = getAngleBetweenVectors(v1, v2, dotTreshold);

  // Get vector pointing up or down
  const cross = new THREE.Vector3().crossVectors(v1, v2);
  // Compare cross with normal to find out direction
  if (normal.dot(cross) < 0) {
    angle = -angle;
  }

  return angle;
}

export function getAngleBetweenVectors(
  v1: THREE.Vector3,
  v2: THREE.Vector3,
  dotTreshold: number = 0.0005
): number {
  let angle: number;
  const dot = v1.dot(v2);

  // If dot is close to 1, we'll round angle to zero
  if (dot > 1 - dotTreshold) {
    angle = 0;
  } else {
    // Dot too close to -1
    if (dot < -1 + dotTreshold) {
      angle = Math.PI;
    } else {
      // Get angle difference in radians
      angle = Math.acos(dot);
    }
  }

  return angle;
}

export function appplyVectorMatrixXZ(
  a: THREE.Vector3,
  b: THREE.Vector3
): THREE.Vector3 {
  return new THREE.Vector3(a.x * b.z + a.z * b.x, b.y, a.z * b.z + -a.x * b.x);
}

export function getGeometryInfo(
  geometry: THREE.BufferGeometry,
  vertices: number[],
  indices: number[]
) {
  if (geometry.index === null) {
    vertices.push(...(geometry.attributes.position.array as number[]));
  } else {
    vertices.push(
      ...(geometry.clone().toNonIndexed().attributes.position.array as number[])
    );
  }

  indices.push(...Object.keys(vertices).map(Number));
}

export function createTrimesh(geometry: THREE.BufferGeometry): CANNON.Trimesh {
  let vertices;
  if (geometry.index === null) {
    vertices = geometry.attributes.position.array as number[];
  } else {
    vertices = geometry.clone().toNonIndexed().attributes.position
      .array as number[];
  }
  const indices = Object.keys(vertices).map(Number);
  return new CANNON.Trimesh(vertices, indices);
}

export function createConvexPolyhedron(
  geometry: THREE.BufferGeometry
): CANNON.ConvexPolyhedron {
  const position = geometry.attributes.position;
  const normal = geometry.attributes.normal;
  const vertices: THREE.Vector3[] = [];
  for (let i = 0; i < position.count; i++) {
    vertices.push(new THREE.Vector3().fromBufferAttribute(position, i));
  }
  const faces: Face3[] = [];
  for (let i = 0; i < position.count; i += 3) {
    const vertexNormals =
      normal === undefined
        ? []
        : [
            new THREE.Vector3().fromBufferAttribute(normal, i),
            new THREE.Vector3().fromBufferAttribute(normal, i + 1),
            new THREE.Vector3().fromBufferAttribute(normal, i + 2),
          ];
    const face: Face3 = {
      a: i,
      b: i + 1,
      c: i + 2,
      normals: vertexNormals,
    };
    faces.push(face);
  }

  const verticesMap: { [key: string]: number } = {};
  const points: CANNON.Vec3[] = [];
  const changes: number[] = [];
  for (let i = 0, il = vertices.length; i < il; i++) {
    const v = vertices[i];
    const key =
      Math.round(v.x * 100) +
      "_" +
      Math.round(v.y * 100) +
      "_" +
      Math.round(v.z * 100);
    if (verticesMap[key] === undefined) {
      verticesMap[key] = i;
      points.push(new CANNON.Vec3(vertices[i].x, vertices[i].y, vertices[i].z));
      changes[i] = points.length - 1;
    } else {
      changes[i] = changes[verticesMap[key]];
    }
  }

  const faceIdsToRemove = [];
  for (let i = 0, il = faces.length; i < il; i++) {
    const face = faces[i];
    face.a = changes[face.a];
    face.b = changes[face.b];
    face.c = changes[face.c];
    const indices = [face.a, face.b, face.c];
    for (let n = 0; n < 3; n++) {
      if (indices[n] === indices[(n + 1) % 3]) {
        faceIdsToRemove.push(i);
        break;
      }
    }
  }

  for (let i = faceIdsToRemove.length - 1; i >= 0; i--) {
    const idx = faceIdsToRemove[i];
    faces.splice(idx, 1);
  }

  const cannonFaces: number[][] = faces.map(function (f) {
    return [f.a, f.b, f.c];
  });

  return new CANNON.ConvexPolyhedron({
    vertices: points,
    faces: cannonFaces,
  });
}

export function offsetCenterOfMass(
  body: CANNON.Body,
  centreOfMass: CANNON.Vec3
): void {
  body.shapeOffsets.forEach(function (offset) {
    centreOfMass.vadd(offset, centreOfMass);
  });
  centreOfMass.scale(1 / body.shapes.length, centreOfMass);
  body.shapeOffsets.forEach(function (offset) {
    offset.vsub(centreOfMass, offset);
  });
  const worldCenterOfMass = new CANNON.Vec3();
  body.vectorToWorldFrame(centreOfMass, worldCenterOfMass);
  body.position.vadd(worldCenterOfMass, body.position);
}

export function characterStateFactory(
  stateName: StateType,
  character: Character,
  animationName: string = ""
) {
  switch (stateName) {
    case StateType.Idle:
      return new Idle(character);
    case StateType.IdleRotateLeft:
      return new IdleRotateLeft(character);
    case StateType.IdleRotateRight:
      return new IdleRotateRight(character);
    case StateType.StartWalkBackLeft:
      return new StartWalkBackLeft(character);
    case StateType.StartWalkBackRight:
      return new StartWalkBackRight(character);
    case StateType.StartWalkLeft:
      return new StartWalkLeft(character);
    case StateType.StartWalkRight:
      return new StartWalkRight(character);
    case StateType.StartWalkForward:
      return new StartWalkForward(character);
    case StateType.Walk:
      return new Walk(character);
    case StateType.EndWalk:
      return new EndWalk(character);
    case StateType.Falling:
      return new Falling(character);
    case StateType.DropIdle:
      return new DropIdle(character);
    case StateType.DropRolling:
      return new DropRolling(character);
    case StateType.DropRunning:
      return new DropRunning(character);
    case StateType.JumpIdle:
      return new JumpIdle(character);
    case StateType.JumpRunning:
      return new JumpRunning(character);
    case StateType.Sprint:
      return new Sprint(character);
    case StateType.OpenVehicleDoor:
      return new OpenVehicleDoor(character, animationName);
    case StateType.EnteringVehicle:
      return new EnteringVehicle(character, animationName);
    case StateType.Driving:
      return new Driving(character);
    case StateType.Sitting:
      return new Sitting(character);
    default:
      return new Idle(character);
  }
}

export function fixedVec3(vec: THREE.Vector3) {
  return new THREE.Vector3(
    +vec.x.toFixed(2),
    +vec.y.toFixed(2),
    +vec.z.toFixed(2)
  );
}
export function fixedQuat(quat: THREE.Quaternion) {
  return new THREE.Quaternion(
    +quat.x.toFixed(2),
    +quat.y.toFixed(2),
    +quat.z.toFixed(2),
    +quat.w.toFixed(2)
  );
}

export function checkDiffVec(vec1: THREE.Vector3, vec2: THREE.Vector3) {
  if (
    Math.abs(vec1.x - vec2.x) +
      Math.abs(vec1.y - vec2.y) +
      Math.abs(vec1.z - vec2.z) >
    0.005
  ) {
    return true;
  }
  return false;
}
export function checkDiffQuat(
  quat1: THREE.Quaternion,
  quat2: THREE.Quaternion
) {
  if (
    Math.abs(quat1.x - quat2.x) +
      Math.abs(quat1.y - quat2.y) +
      Math.abs(quat1.z - quat2.z) +
      Math.abs(quat1.w - quat2.w) >
    0.005
  ) {
    return true;
  }
  return false;
}

export function lerp(start: number, end: number, amt: number) {
  return (1 - amt) * start + amt * end;
}

export function lerpVector(
  start: THREE.Vector3,
  end: THREE.Vector3,
  amt: number
) {
  const lx = (1 - amt) * start.x + amt * end.x;
  const ly = (1 - amt) * start.y + amt * end.y;
  const lz = (1 - amt) * start.z + amt * end.z;
  return new THREE.Vector3(lx, ly, lz);
}

export function lerpQuaternion(
  start: THREE.Quaternion,
  end: THREE.Quaternion,
  amt: number
) {
  const lx = (1 - amt) * start.x + amt * end.x;
  const ly = (1 - amt) * start.y + amt * end.y;
  const lz = (1 - amt) * start.z + amt * end.z;
  const lw = (1 - amt) * start.w + amt * end.w;
  return new THREE.Quaternion(lx, ly, lz, lw);
}
