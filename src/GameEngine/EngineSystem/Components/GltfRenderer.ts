import { Component } from "../Component";
import { Loader } from "../../Utils/Loader";

export class GltfRenderer extends Component {
  private url: string;

  constructor(url: string) {
    super();
    this.url = url;
  }

  async Start() {
    const glb = await Loader.getInstance().GetGLTFLoader().loadAsync(this.url);
    this.gameObject.add(glb.scene);
  }
}
