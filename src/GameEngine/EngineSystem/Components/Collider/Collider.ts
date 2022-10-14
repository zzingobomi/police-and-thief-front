import { Component } from "../../Component";
import * as CANNON from "cannon-es";

export class Collider extends Component {
  public mass: number;
  public body: CANNON.Body;
  public shape: CANNON.Shape;
  public center: CANNON.Vec3 = new CANNON.Vec3();
  public debugMesh: THREE.Mesh;
  public material: CANNON.Material;
}
