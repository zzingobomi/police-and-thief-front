import { Component } from "../component";
import { Capsule, GLTFLoader } from "three-stdlib";
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
import { AnimationAction, AnimationMixer, BoxHelper, Group } from "three";
import { STATE } from "../utils/player-state";
import { BasicCharacterControllerInput } from "./player-input";
import { IVec3 } from "../interface/player-data";

export class AnimationMap {
  [key: string]: AnimationAction;
}

export class BasicCharacterController extends Component {
  private _target: Group | null;

  private _loader: GLTFLoader;

  private _animations: AnimationMap;
  private _mixer: AnimationMixer | null;

  private _stateMachine: CharacterFSM | null;

  private _speed = 0;
  private _maxSpeed = 0;
  private _acceleration = 0;

  private _bOnTheGround = false;
  private _fallingAcceleration = 0;
  private _fallingSpeed = 0;

  private _previousDirectionOffset = 0;

  private _capsule: Capsule | null;
  private _boxHelper: BoxHelper | null;

  constructor() {
    super();
    this._target = null;
    this._loader = new GLTFLoader();
    this._animations = {};
    this._mixer = null;
    this._stateMachine = null;

    this._capsule = null;
    this._boxHelper = null;
  }

  public InitComponent(): void {
    this._loadModel();
  }

  public Update(time: number): void {
    if (!this._stateMachine) {
      return;
    }

    // TODO: Update에서 얻지 말고 최적화 하기
    const input = this.GetComponent(
      BASIC_CHARACTER_CONTROLLER_INPUT
    ) as BasicCharacterControllerInput;
    const camera = (
      this.FindEntity(THREEJS)?.GetComponent(
        THREEJS_CONTROLLER
      ) as ThreeJSController
    ).GetCamera();
    const octree = this.FindEntity(OCTREE)?.GetComponent(
      OCTREE_CONTROLLER
    ) as OctreeController;

    this._stateMachine.Update(time, input);

    if (this._mixer) {
      this._mixer.update(time);
    }

    const currentState = this._stateMachine.GetCurrentState();
    if (!currentState) {
      return;
    }

    if (!this._target || !camera || !this._capsule) {
      return;
    }

    if (currentState.Name === STATE.IDLE) {
      this._speed = 0;
      this._maxSpeed = 0;
      this._acceleration = 0;
    }
    if (currentState.Name === STATE.WALK) {
      this._maxSpeed = 80;
      this._acceleration = 3;
    }
    if (currentState.Name === STATE.RUN) {
      this._maxSpeed = 350;
      this._acceleration = 3;
    }

    const angleCameraDirectionAxisY =
      Math.atan2(
        camera.position.x - this._target.position.x,
        camera.position.z - this._target.position.z
      ) + Math.PI;

    const rotateQuarternion = new THREE.Quaternion();
    rotateQuarternion.setFromAxisAngle(
      new THREE.Vector3(0, 1, 0),
      angleCameraDirectionAxisY + this._directionOffset(input)
    );

    this._target.quaternion.rotateTowards(
      rotateQuarternion,
      THREE.MathUtils.degToRad(5)
    );

    // 카메라가 바라보는 방향
    const walkDirection = new THREE.Vector3();
    camera.getWorldDirection(walkDirection);

    walkDirection.y = this._bOnTheGround ? 0 : -1;
    walkDirection.normalize();

    walkDirection.applyAxisAngle(
      new THREE.Vector3(0, 1, 0),
      this._directionOffset(input)
    );

    // 걷다가 뛸때 미끄러지는 현상 개선
    if (this._speed < this._maxSpeed) this._speed += this._acceleration;
    else this._speed -= this._acceleration * 2;

    if (!this._bOnTheGround) {
      this._fallingAcceleration += 1;
      this._fallingSpeed += Math.pow(this._fallingAcceleration, 2);
    } else {
      this._fallingAcceleration = 0;
      this._fallingSpeed = 0;
    }

    const velocity = new THREE.Vector3(
      walkDirection.x * this._speed,
      walkDirection.y * this._fallingSpeed,
      walkDirection.z * this._speed
    );

    const deltaPosition = velocity.clone().multiplyScalar(time);

    this._capsule.translate(deltaPosition);

    const result = octree.CapsuleIntersect(this._capsule);
    // 충돌한 경우
    if (result) {
      this._capsule.translate(result.normal.multiplyScalar(result.depth));
      this._bOnTheGround = true;
    }
    // 충돌하지 않은 경우
    else {
      this._bOnTheGround = false;
    }

    const previousPosition = this._target.position.clone();
    const capsuleHeight =
      this._capsule.end.y - this._capsule.start.y + this._capsule.radius * 2;

    this._target.position.set(
      this._capsule.start.x,
      this._capsule.start.y - this._capsule.radius + capsuleHeight / 2,
      this._capsule.start.z
    );

    camera.position.x -= previousPosition.x - this._target.position.x;
    camera.position.z -= previousPosition.z - this._target.position.z;

    // TODO: 여기서 move update?

    // if (this._boxHelper) {
    //   this._boxHelper.update();
    // }
  }

  private _directionOffset(input: BasicCharacterControllerInput) {
    let directionOffset = 0; // w

    if (input.Keys.forward) {
      if (input.Keys.left) {
        directionOffset = Math.PI / 4; // w+a (45도)
      } else if (input.Keys.right) {
        directionOffset = -Math.PI / 4; // w+d (-45도)
      }
    } else if (input.Keys.backward) {
      if (input.Keys.left) {
        directionOffset = Math.PI / 4 + Math.PI / 2; // s+a (135도)
      } else if (input.Keys.right) {
        directionOffset = -Math.PI / 4 - Math.PI / 2; // s+d (-135도)
      } else {
        directionOffset = Math.PI; // s (180도)
      }
    } else if (input.Keys.left) {
      directionOffset = Math.PI / 2; // a (90도)
    } else if (input.Keys.right) {
      directionOffset = -Math.PI / 2; // d (-90도)
    } else {
      directionOffset = this._previousDirectionOffset;
    }

    this._previousDirectionOffset = directionOffset;

    return directionOffset;
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

      // 캐릭터 모델의 boundingbox 구하기
      const box = new THREE.Box3().setFromObject(model);
      model.position.y = (box.max.y - box.min.y) / 2;

      const height = box.max.y - box.min.y;
      const diameter = box.max.z - box.min.z;

      this._capsule = new Capsule(
        new THREE.Vector3(0, diameter / 2, 0),
        new THREE.Vector3(0, height - diameter / 2, 0),
        diameter / 2
      );

      // model의 바운딩 helper
      // const boxHelper = new THREE.BoxHelper(model);
      // scene.add(boxHelper);
      // this._boxHelper = boxHelper;
    });
  }

  public GetPosition() {
    if (!this._target) return;
    const position: IVec3 = {
      x: this._target?.position.x,
      y: this._target?.position.y,
      z: this._target?.position.z,
    };
    return position;
  }
  public GetRotation() {
    if (!this._target) return;
    const rotation: IVec3 = {
      x: this._target?.rotation.x,
      y: this._target?.rotation.y,
      z: this._target?.rotation.z,
    };
    return rotation;
  }
  public GetScale() {
    if (!this._target) return;
    const scale: IVec3 = {
      x: this._target?.scale.x,
      y: this._target?.scale.y,
      z: this._target?.scale.z,
    };
    return scale;
  }

  public GetCurrentState() {
    return this._stateMachine?.GetCurrentState();
  }
}
