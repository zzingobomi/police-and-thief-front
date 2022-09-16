import { AnimationMixer, Group } from "three";
import { GLTFLoader } from "three-stdlib";
import { Component } from "../component";
import {
  OCTREE,
  OCTREE_CONTROLLER,
  THREEJS,
  THREEJS_CONTROLLER,
} from "../constant";
import { CharacterFSM } from "../utils/character-fsm";
import { OctreeController } from "./octree-controller";
import { AnimationMap } from "./player-entity";
import { ThreeJSController } from "./threejs-controller";
import * as THREE from "three";
import { STATE } from "../utils/player-state";
import { IVec3 } from "../interface/player-data";

export class NpcController extends Component {
  private _target: Group | null;

  private _loader: GLTFLoader;

  private _animations: AnimationMap;
  private _mixer: AnimationMixer | null;

  private _stateMachine: CharacterFSM | null;

  // TODO: 다른방법 생각해보기..
  private _initialPosition: IVec3 | null;

  constructor() {
    super();
    this._target = null;
    this._loader = new GLTFLoader();
    this._animations = {};
    this._mixer = null;
    this._stateMachine = null;

    this._initialPosition = null;
  }

  public InitComponent(): void {
    this._loadModel();
  }

  public SetPosition(position: IVec3) {
    this._target?.position.set(position.x, position.y, position.z);
  }
  public SetRotation(rotation: IVec3) {
    this._target?.rotation.set(rotation.x, rotation.y, rotation.z);
  }
  public SetScale(scale: IVec3) {
    this._target?.scale.set(scale.x, scale.y, scale.z);
  }
  public SetCurrentState(name: string) {
    this._stateMachine?.SetState(name);
  }

  private _loadModel() {
    this._loader.load("./data/Police_01.glb", (glb) => {
      const model = glb.scene;
      const octree = this.FindEntity(OCTREE)?.GetComponent(
        OCTREE_CONTROLLER
      ) as OctreeController;
      const threejs = this.FindEntity(THREEJS)?.GetComponent(
        THREEJS_CONTROLLER
      ) as ThreeJSController;
      const scene = threejs.GetScene();

      scene.add(model);

      this._target = glb.scene;

      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
        }
      });

      octree.AddModel(model);

      const animationClips = glb.animations;
      this._mixer = new THREE.AnimationMixer(this._target);
      animationClips.forEach((clip) => {
        const name = clip.name;
        //console.log(name);
        if (this._mixer) this._animations[name] = this._mixer.clipAction(clip);
      });

      this._stateMachine = new CharacterFSM(this._animations);
      this._stateMachine.SetState(STATE.IDLE);

      if (this._initialPosition) {
        this._target.position.set(
          this._initialPosition.x,
          this._initialPosition.y,
          this._initialPosition.z
        );
      }
    });
  }

  public Update(time: number): void {
    if (!this._stateMachine) {
      return;
    }

    this._stateMachine.Update(time);

    if (this._mixer) {
      this._mixer.update(time);
    }
  }

  public SetInitialPosition(position: IVec3) {
    this._initialPosition = position;
  }
}