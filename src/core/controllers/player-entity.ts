import { Component } from "../component";
import { Capsule, GLTF, GLTFLoader } from "three-stdlib";
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
import {
  AnimationAction,
  AnimationMixer,
  BoxHelper,
  Group,
  PerspectiveCamera,
} from "three";
import { STATE } from "../utils/player-state";
import { BasicCharacterControllerInput } from "./player-input";
import { IPlayerData, IVec3 } from "../interface/player-data";
import * as Colyseus from "colyseus.js";
import { ColyseusStore } from "../../store";

const GRAVITY = 30;

export class AnimationMap {
  [key: string]: AnimationAction;
}

export class BasicCharacterController extends Component {
  private _target: Group | null;

  private _loader: GLTFLoader;

  private _animations: AnimationMap;
  private _mixer: AnimationMixer | null;

  private _stateMachine: CharacterFSM | null;

  //private _speed = 0;
  //private _maxSpeed = 0;
  //private _acceleration = 0;

  private _velocity = new THREE.Vector3(0, 0, 0);
  private _acceleration = new THREE.Vector3(1, 0.125, 300.0);
  private _decceleration = new THREE.Vector3(-0.0005, -0.0001, -5.0);

  private _bOnTheGround = false;
  private _fallingAcceleration = 0;
  private _fallingSpeed = 0;

  private _previousDirectionOffset = 0;

  private _capsule: Capsule | null;
  private _boxHelper: BoxHelper | null;

  // TODO: 다른방법 생각해보기..
  private _initialPosition: IVec3 | null;

  private _socket: Colyseus.Room | null;

  private _camera: PerspectiveCamera | null;
  private _playerVelocity = new THREE.Vector3();
  private _playerDirection = new THREE.Vector3();

  constructor() {
    super();
    this._target = null;
    this._loader = new GLTFLoader();
    this._animations = {};
    this._mixer = null;
    this._stateMachine = null;

    this._capsule = null;
    this._boxHelper = null;

    this._initialPosition = null;

    this._socket = ColyseusStore.getInstance().GetRoom();

    this._camera = null;
  }

  public InitComponent(): void {
    this._camera = (
      this.FindEntity(THREEJS)?.GetComponent(
        THREEJS_CONTROLLER
      ) as ThreeJSController
    ).GetCamera();
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
    if (!this._target || !this._capsule || !this._camera) {
      return;
    }

    // TODO: 아직 이상하게 움직인다..
    // gives a bit of air control
    const speedDelta = time * (this._bOnTheGround ? 25 : 8);
    const forwardVector = this.getForwardVector();
    const sideVector = this.getSideVector();
    if (!forwardVector || !sideVector) return;

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

    let damping = Math.exp(-4 * time) - 1;
    if (!this._bOnTheGround) {
      this._playerVelocity.y -= GRAVITY * time;

      // small air resistance
      damping *= 0.1;
    }

    this._playerVelocity.addScaledVector(this._playerVelocity, damping);

    const deltaPosition = this._playerVelocity.clone().multiplyScalar(time);
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

    this._camera.position.copy(this._capsule.end);

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

    // TODO: 뭔가가 바뀌었을때만 보내야 할거 같긴한데.. 최적화 필요..
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

    // TODO: 여기서 move update?
    // if (this._boxHelper) {
    //   this._boxHelper.update();
    // }
  }

  private getForwardVector() {
    if (!this._camera) return;

    this._camera.getWorldDirection(this._playerDirection);
    this._playerDirection.y = 0;
    this._playerDirection.normalize();

    return this._playerDirection;
  }

  private getSideVector() {
    if (!this._camera) return;

    this._camera.getWorldDirection(this._playerDirection);
    this._playerDirection.y = 0;
    this._playerDirection.normalize();
    this._playerDirection.cross(this._camera.up);

    return this._playerDirection;
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

    if (!this._initialPosition) return;

    this._target.position.set(
      this._initialPosition.x,
      this._initialPosition.y,
      this._initialPosition.z
    );

    // 캐릭터 모델의 boundingbox 구하기
    const box = new THREE.Box3().setFromObject(model);
    model.position.y = (box.max.y - box.min.y) / 2;

    const height = box.max.y - box.min.y;
    const diameter = box.max.z - box.min.z;

    this._capsule = new Capsule(
      new THREE.Vector3(
        this._initialPosition.x,
        diameter / 2,
        this._initialPosition.z
      ),
      new THREE.Vector3(
        this._initialPosition.x,
        height - diameter / 2,
        this._initialPosition.z
      ),
      diameter / 2
    );

    /*
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
    */
  }

  public SetInitialPosition(position: IVec3) {
    this._initialPosition = position;
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
