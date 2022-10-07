import { Collider } from "./Collider";
import * as CANNON from "cannon-es";

export class SphereCollider extends Collider {
  private radius: number;

  constructor(radius?: number) {
    super();
    this.radius = radius || 1;
  }

  public Start() {
    this.shape = new CANNON.Sphere(this.radius);
  }

  public Dispose() {
    // TODO:
  }

  get Radius() {
    return this.radius;
  }
  set Radius(radius: number) {
    this.radius = radius;
  }
}
