import { Component } from "../component";
import { GLTFLoader } from "three-stdlib";
import { OctreeController } from "../controllers/octree-controller";
import { ThreeJSController } from "../controllers/threejs-controller";
import * as THREE from "three";
import {
  OCTREE,
  OCTREE_CONTROLLER,
  THREEJS,
  THREEJS_CONTROLLER,
} from "../constant";

export class StaticModelComponent extends Component {
  private _loader: GLTFLoader;
  constructor() {
    super();
    this._loader = new GLTFLoader();
  }

  public InitComponent(): void {
    this._loadModel();
  }

  // TODO: 캐릭터 모델링 없애기
  // texture 어색한부분 수정
  private _loadModel() {
    this._loader.load("./data/jail.glb", (glb) => {
      const model = glb.scene;
      const octree = this.FindEntity(OCTREE)?.GetComponent(OCTREE_CONTROLLER);
      const threejs =
        this.FindEntity(THREEJS)?.GetComponent(THREEJS_CONTROLLER);
      const scene = (threejs as ThreeJSController).GetScene();

      scene.add(model);

      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      (octree as OctreeController).AddModel(model);
    });
  }
}
