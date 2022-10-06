import { Collider } from "./Collider";
import * as CANNON from "cannon-es";

export class SphereCollider extends Collider {
  private center: CANNON.Vec3 = new CANNON.Vec3();
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

  get Center() {
    return this.center;
  }
  set Center(center: CANNON.Vec3) {
    this.center = center;
  }

  get Radius() {
    return this.radius;
  }
  set Radius(radius: number) {
    this.radius = radius;
  }
}
