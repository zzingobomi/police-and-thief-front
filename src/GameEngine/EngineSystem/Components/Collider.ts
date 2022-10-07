import { Component } from "../Component";
import * as CANNON from "cannon-es";

export class Collider extends Component {
  public shape: CANNON.Shape;
  public center: CANNON.Vec3 = new CANNON.Vec3();
  protected material: CANNON.Material;

  get Center() {
    return this.center;
  }
  set Center(center: CANNON.Vec3) {
    this.center = center;
  }
}
