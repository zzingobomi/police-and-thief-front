import { Component } from "@trixt0r/ecs";
import { GLTF, GLTFLoader } from "three-stdlib";
import * as THREE from "three";

export class GltfRenderer implements Component {
  public url: string;
  public loader: GLTFLoader;
  public model: THREE.Group;
  constructor(url: string) {
    this.url = url;
    this.loader = new GLTFLoader();
    this.model = new THREE.Group();

    this.initModel();
  }

  private async initModel() {
    const glb = await this.loader.loadAsync(this.url);
    this.model.add(glb.scene);
  }
}
