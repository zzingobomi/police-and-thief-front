import * as _ from "lodash";
import * as CANNON from "cannon-es";
import * as THREE from "three";
import { Space } from "../enums/Space";

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