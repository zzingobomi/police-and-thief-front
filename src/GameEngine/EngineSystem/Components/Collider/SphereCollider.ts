import { Collider } from "./Collider";
import * as CANNON from "cannon-es";
import { Vector3 } from "three";
import CannonUtils from "../../../Utils/CannonUtils";

export interface SphereColliderOptions {
  mass?: number;
  center?: Vector3;
  radius?: number;
}

export class SphereCollider extends Collider {
  public options: SphereColliderOptions = {};

  constructor(options?: SphereColliderOptions) {
    super();
    this.mass = options?.mass || 0;
    this.center = options?.center
      ? CannonUtils.cannonVector(options.center)
      : new CANNON.Vec3(0, 0, 0);
    this.options.radius = options?.radius || 0.3;
  }

  public Start() {
    this.shape = new CANNON.Sphere(this.options.radius!);
    this.body = new CANNON.Body({
      mass: this.mass,
      position: CannonUtils.cannonVector(this.gameObject.position).vadd(
        this.center
      ),
      shape: this.shape,
    });

    // TODO: material
  }

  public Dispose() {
    // TODO:
  }
}
