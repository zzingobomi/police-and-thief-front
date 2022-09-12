import { Component } from "../component";
import { GLTFLoader } from "three-stdlib";
import {
  OCTREE,
  OCTREE_CONTROLLER,
  THREEJS,
  THREEJS_CONTROLLER,
} from "../constant";
import { ThreeJSController } from "./threejs-controller";
import * as THREE from "three";
import { OctreeController } from "./octree-controller";
import { CharacterFSM } from "../utils/character-fsm";
import { AnimationAction, AnimationMixer, Group } from "three";
import { STATE } from "../utils/player-state";

export class AnimationMap {
  [key: string]: AnimationAction;
}

export class BasicCharacterController extends Component {
  private _target: Group | null;

  private _loader: GLTFLoader;

  private _animations: AnimationMap;
  private _mixer: AnimationMixer | null;

  private _stateMachine: CharacterFSM | null;

  constructor() {
    super();
    this._target = null;
    this._loader = new GLTFLoader();
    this._animations = {};
    this._mixer = null;
    this._stateMachine = null;
  }

  public InitComponent(): void {
    this._loadModel();
  }

  private _loadModel() {
    this._loader.load("./data/Police_01.glb", (glb) => {
      const model = glb.scene;
      const octree = this.FindEntity(OCTREE)?.GetComponent(OCTREE_CONTROLLER);
      const threejs =
        this.FindEntity(THREEJS)?.GetComponent(THREEJS_CONTROLLER);
      const scene = (threejs as ThreeJSController).GetScene();

      scene.add(model);

      this._target = glb.scene;

      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
        }
      });

      (octree as OctreeController).AddModel(model);

      const animationClips = glb.animations;
      this._mixer = new THREE.AnimationMixer(this._target);
      animationClips.forEach((clip) => {
        const name = clip.name;
        console.log(name);
        if (this._mixer) this._animations[name] = this._mixer.clipAction(clip);
      });

      this._stateMachine = new CharacterFSM(this._animations);
      this._stateMachine.SetState(STATE.IDLE);
    });
  }
}
