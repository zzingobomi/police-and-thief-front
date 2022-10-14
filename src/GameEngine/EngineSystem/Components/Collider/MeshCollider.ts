import { Collider } from "./Collider";
import CannonUtils from "../../../Utils/CannonUtils";

export class MeshCollider extends Collider {
  private mesh: THREE.Mesh;
  constructor(mesh: THREE.Mesh) {
    super();
    this.mesh = mesh;
  }

  public Start() {
    this.shape = CannonUtils.CreateTrimesh(this.mesh.geometry);
  }
}
