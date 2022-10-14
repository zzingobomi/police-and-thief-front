import { Collider } from "./Collider";
import CannonUtils from "../../../Utils/CannonUtils";
import { Vector3 } from "three";
import * as CANNON from "cannon-es";

export interface MeshColliderOptions {
  mass?: number;
  center?: Vector3;
}

export class MeshCollider extends Collider {
  public mesh: THREE.Mesh;
  public options: MeshColliderOptions = {};

  constructor(mesh: THREE.Mesh, options?: MeshColliderOptions) {
    super();
    this.mesh = mesh;
    this.mass = options?.mass || 0;
    this.center = options?.center
      ? CannonUtils.cannonVector(options.center)
      : new CANNON.Vec3(0, 0, 0);
  }

  public Start() {
    this.shape = CannonUtils.CreateTrimesh(this.mesh.geometry);
    this.body = new CANNON.Body({
      mass: this.mass,
      position: CannonUtils.cannonVector(this.mesh.position).vadd(this.center),
      quaternion: CannonUtils.cannonQuat(this.mesh.quaternion),
      shape: this.shape,
    });

    // TODO: material
  }
}
