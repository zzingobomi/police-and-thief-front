import { Collider } from "./Collider";
import * as CANNON from "cannon-es";

// TODO: 모양 이상함...
export class MeshCollider extends Collider {
  private mesh: THREE.Mesh;
  constructor(mesh: THREE.Mesh) {
    super();
    this.mesh = mesh;
  }

  public Start() {
    this.shape = new CANNON.Trimesh(
      this.mesh.geometry.getAttribute("position").array as number[],
      this.mesh.geometry.index?.array as number[]
    );
  }
}
