import { Component } from "../Component";

export class MeshRenderer extends Component {
  private mesh: THREE.Mesh;

  constructor(mesh: THREE.Mesh) {
    super();
    this.mesh = mesh;
  }

  async Start() {
    this.gameObject.add(this.mesh);
  }
}
