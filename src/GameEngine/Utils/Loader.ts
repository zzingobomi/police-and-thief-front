import { GLTFLoader } from "three-stdlib";

export class Loader {
  private static instance: Loader;

  public gltfLoader: GLTFLoader;

  private constructor() {
    this.gltfLoader = new GLTFLoader();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new Loader();
    }
    return this.instance;
  }

  public GetGLTFLoader() {
    return this.gltfLoader;
  }
}
