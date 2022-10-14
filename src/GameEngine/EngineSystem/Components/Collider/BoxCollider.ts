import { Collider } from "./Collider";
import * as CANNON from "cannon-es";
import { Vector3 } from "three";

export class BoxCollider extends Collider {
  private size: Vector3 = new Vector3(0.3, 0.3, 0.3);

  constructor(radius?: number) {
    super();
  }

  public Start() {}

  public Dispose() {}
}
