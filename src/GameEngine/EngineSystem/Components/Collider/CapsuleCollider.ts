import { Collider } from "./Collider";
import * as CANNON from "cannon-es";
import { Vector3 } from "three";
import CannonUtils from "../../../Utils/CannonUtils";

export interface CapsuleColliderOptions {
  mass?: number;
  center?: Vector3;
  height?: number;
  radius?: number;
  segments?: number;
}

export class CapsuleCollider extends Collider {
  public options: CapsuleColliderOptions = {};

  constructor(options?: CapsuleColliderOptions) {
    super();
    this.mass = options?.mass || 0;
    this.center = options?.center
      ? CannonUtils.cannonVector(options.center)
      : new CANNON.Vec3(0, 0, 0);
    this.options.height = options?.height || 0.5;
    this.options.radius = options?.radius || 0.3;
    this.options.segments = options?.segments || 8;
  }

  public Start() {
    this.shape = new CANNON.Sphere(this.options.radius!);
    this.body = new CANNON.Body({
      mass: this.mass,
      position: CannonUtils.cannonVector(this.gameObject.position).vadd(
        this.center
      ),
    });

    // TODO: material

    this.body.addShape(this.shape, new CANNON.Vec3(0, 0, 0));
    this.body.addShape(
      this.shape,
      new CANNON.Vec3(0, this.options.height! / 2, 0)
    );
    this.body.addShape(
      this.shape,
      new CANNON.Vec3(0, -this.options.height! / 2, 0)
    );
  }

  public Dispose() {}
}
