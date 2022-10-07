import { GLTFLoader } from "three-stdlib";
import { Manager } from "../Utils/Manager";
import PubSub from "pubsub-js";
import { SignalType } from "../Enums/SignalType";
import * as THREE from "three";

export class AssetManager extends Manager {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static assetsMap: Map<string, any> = new Map();

  private gltfLoader: GLTFLoader = new GLTFLoader();

  constructor() {
    super();
    this.createDefaultAsset();
  }

  public Start(): void {}

  public Update(delta: number): void {}

  public Dispose(): void {}

  private async createDefaultAsset() {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({
        color: "#777777",
        metalness: 0.3,
        roughness: 0.4,
      })
    );
    floor.receiveShadow = true;
    AssetManager.AddAsset("floor", floor);

    const shpere = new THREE.Mesh(
      new THREE.SphereGeometry(1),
      new THREE.MeshStandardMaterial({
        color: "#777777",
      })
    );
    AssetManager.AddAsset("shpere", shpere);

    // TODO: animation 정보도 저장해야함..
    const book = await this.gltfLoader.loadAsync("./glb/book.glb");
    AssetManager.AddAsset("book", book.scene);

    const man = await this.gltfLoader.loadAsync("./glb/box_man.glb");
    AssetManager.AddAsset("man", man.scene);

    PubSub.publish(SignalType.ASSETS_LOADED);
  }

  static AddAsset(name: string, asset: any) {
    this.assetsMap.set(name, asset);
  }

  static Find<T>(name: string): T {
    return this.assetsMap.get(name) as T;
  }
}
