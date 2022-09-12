import { Component } from "../component";
import { GLTFLoader } from "three-stdlib";
import {
  BASIC_CHARACTER_CONTROLLER_INPUT,
  OCTREE,
  OCTREE_CONTROLLER,
  THREEJS,
  THREEJS_CONTROLLER,
} from "../constant";
import { ThreeJSController } from "./threejs-controller";
import * as THREE from "three";
import { OctreeController } from "./octree-controller";
import { CharacterFSM } from "../utils/character-fsm";
import { AnimationAction, AnimationMixer, Group, Vector3 } from "three";
import { STATE } from "../utils/player-state";
import { BasicCharacterControllerInput } from "./player-input";

export class AnimationMap {
  [key: string]: AnimationAction;
}

export class BasicCharacterController extends Component {
  private _target: Group | null;

  private _loader: GLTFLoader;

  private _animations: AnimationMap;
  private _mixer: AnimationMixer | null;

  private _stateMachine: CharacterFSM | null;

  // private _decceleration: Vector3;
  // private _acceleration: Vector3;
  // private _velocity: Vector3;
  // private _position: Vector3;

  constructor() {
    super();
    this._target = null;
    this._loader = new GLTFLoader();
    this._animations = {};
    this._mixer = null;
    this._stateMachine = null;

    // this._decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);
    // this._acceleration = new THREE.Vector3(1, 0.125, 50.0);
    // this._velocity = new THREE.Vector3(0, 0, 0);
    // this._position = new THREE.Vector3();
  }

  public InitComponent(): void {
    this._loadModel();
  }

  public Update(time: number): void {
    if (!this._stateMachine) {
      return;
    }

    const input = this.GetComponent(
      BASIC_CHARACTER_CONTROLLER_INPUT
    ) as BasicCharacterControllerInput;
    this._stateMachine.Update(time, input);

    if (this._mixer) {
      this._mixer.update(time);
    }

    const currentState = this._stateMachine.GetCurrentState();
    if (
      currentState &&
      currentState.Name != "walk" &&
      currentState.Name != "run" &&
      currentState.Name != "idle"
    ) {
      return;
    }

    /*
    const velocity = this._velocity;
    const frameDecceleration = new THREE.Vector3(
      velocity.x * this._decceleration.x,
      velocity.y * this._decceleration.y,
      velocity.z * this._decceleration.z
    );
    frameDecceleration.multiplyScalar(time);
    frameDecceleration.z =
      Math.sign(frameDecceleration.z) *
      Math.min(Math.abs(frameDecceleration.z), Math.abs(velocity.z));

    velocity.add(frameDecceleration);

    const controlObject = this._target;
    if (!controlObject || !this._target || !this._parent) {
      console.log("target or parent null!!");
      return;
    }
    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = controlObject.quaternion.clone();

    const acc = this._acceleration.clone();
    if (input.Keys.shift) {
      acc.multiplyScalar(2.0);
    }

    if (input.Keys.forward) {
      velocity.z += acc.z * time;
    }
    if (input.Keys.backward) {
      velocity.z -= acc.z * time;
    }
    if (input.Keys.left) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * Math.PI * time * this._acceleration.y);
      _R.multiply(_Q);
    }
    if (input.Keys.right) {
      _A.set(0, 1, 0);
      _Q.setFromAxisAngle(_A, 4.0 * -Math.PI * time * this._acceleration.y);
      _R.multiply(_Q);
    }

    controlObject.quaternion.copy(_R);

    const oldPosition = new THREE.Vector3();
    oldPosition.copy(controlObject.position);

    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(controlObject.quaternion);
    forward.normalize();

    const sideways = new THREE.Vector3(1, 0, 0);
    sideways.applyQuaternion(controlObject.quaternion);
    sideways.normalize();

    sideways.multiplyScalar(velocity.x * time);
    forward.multiplyScalar(velocity.z * time);

    const pos = controlObject.position.clone();
    pos.add(forward);
    pos.add(sideways);

    controlObject.position.copy(pos);
    this._position.copy(pos);

    this._parent.SetPosition(this._position);
    this._parent.SetQuaternion(this._target.quaternion);
    */
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
