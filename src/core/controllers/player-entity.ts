import { Component } from "../component";
import { Capsule, GLTF, GLTFLoader } from "three-stdlib";
import {
  BASIC_CHARACTER_CONTROLLER_INPUT,
  OCTREE,
  OCTREE_CONTROLLER,
  SPATIAL_GRID_CONTROLLER,
  SPATIAL_HASH_GRID,
  THREEJS,
  THREEJS_CONTROLLER,
} from "../constant";
import { ThreeJSController } from "./threejs-controller";
import * as THREE from "three";
import { OctreeController } from "./octree-controller";
import { CharacterFSM } from "../utils/character-fsm";
import {
  AnimationAction,
  AnimationMixer,
  BoxHelper,
  Group,
  PerspectiveCamera,
  Vector3,
} from "three";
import { State, STATE } from "../utils/player-state";
import { BasicCharacterControllerInput } from "./player-input";
import { IPlayerData, IVec3 } from "../interface/player-data";
import * as Colyseus from "colyseus.js";
import { ColyseusStore } from "../../store";
import PubSub from "pubsub-js";
import { SignalType } from "../signal-type";
import { SpatialGridController } from "./spatial-grid-controller";

export class AnimationMap {
  [key: string]: AnimationAction;
}

export class BasicCharacterController extends Component {
  private _target: Group | null;

  private _loader: GLTFLoader;

  private _animations: AnimationMap;
  private _mixer: AnimationMixer | null;

  private _stateMachine: CharacterFSM | null;
  private _prevState: State | null;

  private _input: BasicCharacterControllerInput | null;
  private _octree: OctreeController | null;

  //private _speed = 0;
  //private _maxSpeed = 0;
  //private _acceleration = 0;

  //private _velocity = new THREE.Vector3(0, 0, 0);
  //private _acceleration = new THREE.Vector3(1, 0.125, 300.0);
  //private _decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);

  private _bOnTheGround = false;
  private _fallingAcceleration = 0;
  private _fallingSpeed = 0;

  private _previousDirectionOffset = 0;

  private _capsule: Capsule | null;
  private _boxHelper: BoxHelper | null;

  // TODO: 다른방법 생각해보기..
  private _initialPosition: IVec3 | null;
  private _initialRotation: IVec3 | null;

  private _camera: PerspectiveCamera | null;
  private _playerVelocity = new THREE.Vector3();

  private _gridController: SpatialGridController | null;

  constructor() {
    super();
    this._target = null;
    this._loader = new GLTFLoader();
    this._animations = {};
    this._mixer = null;
    this._stateMachine = null;
    this._prevState = null;

    this._input = null;
    this._octree = null;

    this._capsule = null;
    this._boxHelper = null;

    this._initialPosition = null;
    this._initialRotation = null;

    this._camera = null;

    this._gridController = null;
  }

  public InitComponent(): void {
    this._camera = (
      this.FindEntity(THREEJS)?.GetComponent(
        THREEJS_CONTROLLER
      ) as ThreeJSController
    ).GetCamera();
    this._input = this.GetComponent(
      BASIC_CHARACTER_CONTROLLER_INPUT
    ) as BasicCharacterControllerInput;
    this._octree = this.FindEntity(OCTREE)?.GetComponent(
      OCTREE_CONTROLLER
    ) as OctreeController;
    this._loadModel();
    this._gridController = this._parent?.GetComponent(
      SPATIAL_GRID_CONTROLLER
    ) as SpatialGridController;
  }

  public Update(time: number): void {
    if (!this._stateMachine) {
      return;
    }

    const input = this._input;
    const octree = this._octree;
    if (!input || !octree) return;

    this._stateMachine.Update(time, input);
    if (this._mixer) {
      this._mixer.update(time);
    }
    const currentState = this._stateMachine.GetCurrentState();
    if (!currentState) return;
    if (this._prevState !== currentState) {
      PubSub.publish(SignalType.UPDATE_STATE, currentState.Name);
    }
    this._prevState = currentState;

    if (!this._target || !this._capsule || !this._camera) {
      return;
    }

    // gives a bit of air control
    let speedDelta = time * (this._bOnTheGround ? 2000 : 1000);
    const forwardVector = this.getForwardVector();
    const sideVector = this.getSideVector();
    if (!forwardVector || !sideVector) return;

    if (input.Keys.shift) {
      speedDelta *= 1.5;
    }
    if (input.Keys.forward) {
      this._playerVelocity.add(forwardVector.multiplyScalar(speedDelta));
    }
    if (input.Keys.backward) {
      this._playerVelocity.add(forwardVector.multiplyScalar(-speedDelta));
    }
    if (input.Keys.left) {
      this._playerVelocity.add(sideVector.multiplyScalar(-speedDelta));
    }
    if (input.Keys.right) {
      this._playerVelocity.add(sideVector.multiplyScalar(speedDelta));
    }
    if (this._bOnTheGround) {
      if (input.Keys.space) {
        this._playerVelocity.y = 500;
      }
    }

    let damping = Math.exp(-4 * time) - 1;
    if (!this._bOnTheGround) {
      this._fallingAcceleration += 1;
      this._fallingSpeed += Math.pow(this._fallingAcceleration, 2);

      this._playerVelocity.y -= this._fallingSpeed * time;

      // small air resistance
      damping *= 0.1;
    } else {
      this._fallingAcceleration = 0;
      this._fallingSpeed = 0;
    }

    this._playerVelocity.addScaledVector(this._playerVelocity, damping);

    const deltaPosition = this._playerVelocity.clone().multiplyScalar(time);

    // 캐릭터 충돌 처리
    const oldPosition = this._target.position.clone();
    const pos = this._target.position.clone();
    pos.add(deltaPosition);

    const collisions = this.findIntersections(pos, oldPosition);
    if (collisions && collisions.length > 0) {
      return;
    }

    this._capsule.translate(deltaPosition);

    const result = octree.CapsuleIntersect(this._capsule);
    this._bOnTheGround = false;
    if (result) {
      this._bOnTheGround = result.normal.y > 0;
      if (!this._bOnTheGround) {
        this._playerVelocity.addScaledVector(
          result.normal,
          -result.normal.dot(this._playerVelocity)
        );
      }

      this._capsule.translate(result.normal.multiplyScalar(result.depth));
    }

    const capsuleHeight =
      this._capsule.end.y - this._capsule.start.y + this._capsule.radius * 2;
    this._target.position.set(
      this._capsule.start.x,
      this._capsule.start.y - this._capsule.radius + capsuleHeight / 2,
      this._capsule.start.z
    );

    this._camera.position.copy(this._capsule.end);

    PubSub.publish(SignalType.UPDATE_POSITION, {
      x: this._target.position.x,
      y: this._target.position.y,
      z: this._target.position.z,
    });

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
    const _Q = new THREE.Quaternion();
    const _A = new THREE.Vector3();
    const _R = controlObject.quaternion.clone();

    const acc = this._acceleration.clone();
    if (input.Keys.shift) {
      acc.multiplyScalar(5.0);
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

    if (!this._bOnTheGround) {
      this._fallingAcceleration += 1;
      this._fallingSpeed += Math.pow(this._fallingAcceleration, 2);
      //console.log(this._fallingSpeed * time, controlObject.position.y);
      controlObject.position.y -= -this._fallingSpeed * time;
    } else {
      this._fallingAcceleration = 0;
      this._fallingSpeed = 0;
    }

    const deltaPosition = pos.sub(controlObject.position);
    this._capsule.translate(deltaPosition);
    const result = octree.CapsuleIntersect(this._capsule);
    if (result) {
      this._capsule.translate(result.normal.multiplyScalar(result.depth));
      this._bOnTheGround = true;
    } else {
      this._bOnTheGround = false;
    }

    const capsuleHeight =
      this._capsule.end.y - this._capsule.start.y + this._capsule.radius * 2;
    this._target.position.set(
      this._capsule.start.x,
      this._capsule.start.y - this._capsule.radius + capsuleHeight / 2,
      this._capsule.start.z
    );    
    
    const playerInfo: IPlayerData = {
      position: {
        x: this._target?.position.x,
        y: this._target?.position.y,
        z: this._target?.position.z,
      },
      rotation: {
        x: this._target?.rotation.x,
        y: this._target?.rotation.y,
        z: this._target?.rotation.z,
      },
      scale: {
        x: this._target?.scale.x,
        y: this._target?.scale.y,
        z: this._target?.scale.z,
      },
      currentState: currentState.Name,
    };
    this._socket?.send("world.update", playerInfo);
    */

    /*
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
    */

    //camera.position.x -= previousPosition.x - this._target.position.x;
    //camera.position.z -= previousPosition.z - this._target.position.z;

    // if (this._boxHelper) {
    //   this._boxHelper.update();
    // }
  }

  private getForwardVector() {
    if (!this._camera) return;

    const playerDirection = new Vector3();

    this._camera.getWorldDirection(playerDirection);
    playerDirection.y = 0;
    playerDirection.normalize();

    return playerDirection;
  }

  private getSideVector() {
    if (!this._camera) return;

    const playerDirection = new Vector3();

    this._camera.getWorldDirection(playerDirection);
    playerDirection.y = 0;
    playerDirection.normalize();
    playerDirection.cross(this._camera.up);

    return playerDirection;
  }

  private findIntersections(pos: THREE.Vector3, oldPos: THREE.Vector3) {
    const grid = this._gridController;
    if (!grid) return;

    const nearby = grid.FindNearbyEntities(500);
    const collisions = [];

    for (let i = 0; i < nearby.length; ++i) {
      const e = nearby[i].entity;

      if (!e.GetPosition()) continue;

      const d =
        ((pos.x - e.GetPosition().x) ** 2 + (pos.z - e.GetPosition().z) ** 2) **
        0.5;

      if (d <= 50) {
        const d2 =
          ((oldPos.x - e.GetPosition().x) ** 2 +
            (oldPos.z - e.GetPosition().z) ** 2) **
          0.5;

        if (d2 <= 50) {
          continue;
        } else {
          collisions.push(nearby[i].entity);
        }
      }
    }
    return collisions;
  }

  /*
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
  */

  private async _loadModel() {
    const glb = await this._loader.loadAsync("./data/Police_01.glb");
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
    this._target.visible = false;

    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
      }
    });

    const animationClips = glb.animations;
    this._mixer = new THREE.AnimationMixer(this._target);
    animationClips.forEach((clip) => {
      const name = clip.name;
      //console.log(name);
      if (this._mixer) this._animations[name] = this._mixer.clipAction(clip);
    });

    this._stateMachine = new CharacterFSM(this._animations);
    this._stateMachine.SetState(STATE.IDLE);

    if (!this._initialPosition || !this._initialRotation) return;

    this._target.position.set(
      this._initialPosition.x,
      this._initialPosition.y,
      this._initialPosition.z
    );
    this._target.rotation.set(
      this._initialRotation.x,
      this._initialRotation.y,
      this._initialRotation.z
    );

    // 캐릭터 모델의 boundingbox 구하기
    const box = new THREE.Box3().setFromObject(model);
    model.position.y = (box.max.y - box.min.y) / 2;

    const height = box.max.y - box.min.y;
    const diameter = box.max.z - box.min.z;

    this._capsule = new Capsule(
      new THREE.Vector3(
        this._initialPosition.x,
        diameter / 2 + this._initialPosition.y,
        this._initialPosition.z
      ),
      new THREE.Vector3(
        this._initialPosition.x,
        height - diameter / 2 + this._initialPosition.y,
        this._initialPosition.z
      ),
      diameter / 2
    );

    if (this._camera) {
      this._camera.position.copy(this._capsule.end);
      this._camera.rotation.set(
        this._initialRotation.x,
        this._initialRotation.y + Math.PI,
        this._initialRotation.z
      );
    }
  }

  public GetInitialPosition() {
    return this._initialPosition;
  }
  public SetInitialPosition(position: IVec3) {
    this._initialPosition = position;
  }
  public GetInitialRotation() {
    return this._initialRotation;
  }
  public SetInitialRotation(rotation: IVec3) {
    this._initialRotation = rotation;
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
  public SetPosition(position: IVec3) {
    if (!this._target) return;
    this._target.position.set(position.x, position.y, position.z);
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
  public GetQuaternion() {
    if (!this._target) return;
    return this._target.quaternion;
  }
  public SetRotation(rotation: IVec3) {
    if (!this._target) return;
    this._target.rotation.set(rotation.x, rotation.y, rotation.z);
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
  public SetScale(scale: IVec3) {
    if (!this._target) return;
    this._target.scale.set(scale.x, scale.y, scale.z);
  }

  public GetCurrentState() {
    return this._stateMachine?.GetCurrentState();
  }
}
