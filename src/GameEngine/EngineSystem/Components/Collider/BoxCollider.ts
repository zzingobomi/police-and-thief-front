import { Collider } from "./Collider";
import * as CANNON from "cannon-es";
import { Vector3 } from "three";
import CannonUtils from "../../../Utils/CannonUtils";
import { ManagerStore } from "../../../Utils/ManagerStore";
import { PhysicsManager } from "../../../PhysicsSystem/PhysicsManager";

export interface BoxColliderOptions {
  mass?: number;
  center?: Vector3;
  size?: Vector3;
}

export class BoxCollider extends Collider {
  public options: BoxColliderOptions = {};

  constructor(options?: BoxColliderOptions) {
    super();

    this.mass = options?.mass || 0;
    this.center = options?.center
      ? CannonUtils.cannonVector(options.center)
      : new CANNON.Vec3(0, 0, 0);
    this.options.size = options?.size || new Vector3(0.3, 0.3, 0.3);
  }

  public Start() {
    this.shape = new CANNON.Box(CannonUtils.cannonVector(this.options.size!));
    this.body = new CANNON.Body({
      mass: this.mass,
      position: CannonUtils.cannonVector(this.gameObject.position).vadd(
        this.center
      ),
      quaternion: CannonUtils.cannonQuat(this.gameObject.quaternion),
      shape: this.shape,
    });

    // TODO: material

    super.Start();
  }

  public Dispose() {}
}
