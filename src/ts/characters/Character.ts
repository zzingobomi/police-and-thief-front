import * as THREE from "three";
import * as CANNON from "cannon-es";
import { KeyBinding } from "../core/KeyBinding";
import { EntityType } from "../enums/EntityType";
import { IWorldEntity } from "../interfaces/IWorldEntity";
import { CapsuleCollider } from "../physics/colliders/CapsuleCollider";
import { World } from "../world/World";
import { CollisionGroups } from "../enums/CollisionGroups";
import * as Utils from "../utils/FunctionLibrary";
import * as _ from "lodash";
import { ICharacterState } from "../interfaces/ICharacterState";
import { Idle } from "./character_states/Idle";
import { VectorSpringSimulator } from "../physics/colliders/spring_simulation/VectorSpringSimulator";
import { RelativeSpringSimulator } from "../physics/colliders/spring_simulation/RelativeSpringSimulator";

export class Character extends THREE.Object3D implements IWorldEntity {
  public updateOrder = 1;
  public entityType: EntityType = EntityType.Character;

  public height = 0;
  public tiltContainer: THREE.Group;
  public modelContainer: THREE.Group;
  public mixer: THREE.AnimationMixer;
  public oldAction: THREE.AnimationAction;
  public animations: any[];

  // Movement
  public acceleration: THREE.Vector3 = new THREE.Vector3();
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public arcadeVelocityInfluence: THREE.Vector3 = new THREE.Vector3();
  public velocityTarget: THREE.Vector3 = new THREE.Vector3();

  public defaultVelocitySimulatorDamping = 0.8;
  public defaultVelocitySimulatorMass = 50;
  public velocitySimulator: VectorSpringSimulator;
  public moveSpeed = 4;
  public angularVelocity = 0;
  public orientation: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
  public orientationTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
  public defaultRotationSimulatorDamping = 0.5;
  public defaultRotationSimulatorMass = 10;
  public rotationSimulator: RelativeSpringSimulator;
  public viewVector: THREE.Vector3;
  public actions: { [action: string]: KeyBinding };
  public characterCapsule: CapsuleCollider;

  // Ray casting
  public rayResult: CANNON.RaycastResult = new CANNON.RaycastResult();
  public rayHasHit = false;
  public rayCastLength = 0.57;
  public raySafeOffset = 0.03;
  public raycastBox: THREE.Mesh;

  public world: World;
  public charState: ICharacterState;

  private physicsEnabled = true;

  constructor(gltf: any) {
    super();

    this.setAnimations(gltf.animations);

    this.tiltContainer = new THREE.Group();
    this.add(this.tiltContainer);

    this.modelContainer = new THREE.Group();
    this.modelContainer.position.y = -0.57;
    this.tiltContainer.add(this.modelContainer);
    this.modelContainer.add(gltf.scene);

    this.mixer = new THREE.AnimationMixer(gltf.scene);

    this.velocitySimulator = new VectorSpringSimulator(
      60,
      this.defaultVelocitySimulatorMass,
      this.defaultVelocitySimulatorDamping
    );
    this.rotationSimulator = new RelativeSpringSimulator(
      60,
      this.defaultRotationSimulatorMass,
      this.defaultRotationSimulatorDamping
    );

    this.viewVector = new THREE.Vector3();

    // Actions
    this.actions = {
      up: new KeyBinding("KeyW"),
      down: new KeyBinding("KeyS"),
      left: new KeyBinding("KeyA"),
      right: new KeyBinding("KeyD"),
      run: new KeyBinding("ShiftLeft"),
      jump: new KeyBinding("Space"),
      use: new KeyBinding("KeyE"),
      enter: new KeyBinding("KeyF"),
      enter_passenger: new KeyBinding("KeyG"),
      seat_switch: new KeyBinding("KeyX"),
      primary: new KeyBinding("Mouse0"),
      secondary: new KeyBinding("Mouse1"),
    };

    // Physics
    // Player Capsule
    this.characterCapsule = new CapsuleCollider({
      mass: 1,
      position: new CANNON.Vec3(),
      height: 0.5,
      radius: 0.25,
      segments: 8,
      friction: 0.0,
    });
    // TODO: 정확한 의미..
    this.characterCapsule.body.shapes.forEach((shape) => {
      shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
    });
    this.characterCapsule.body.allowSleep = false;

    // Move character to different collision group for raycasting
    this.characterCapsule.body.collisionFilterGroup =
      CollisionGroups.Characters;

    // Disable character rotation
    this.characterCapsule.body.fixedRotation = true;
    this.characterCapsule.body.updateMassProperties();

    // Ray cast debug
    const boxGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const boxMat = new THREE.MeshLambertMaterial({
      color: 0xff0000,
    });
    this.raycastBox = new THREE.Mesh(boxGeo, boxMat);
    this.raycastBox.visible = true;

    // cannon-es latest version에서는 preStep, postStep 없어짐..
    this.characterCapsule.body.preStep = () => {
      this.physicsPreStep();
    };
    this.characterCapsule.body.postStep = () => {
      this.physicsPostStep();
    };

    // States
    this.setState(new Idle(this));
  }

  public setState(state: ICharacterState): void {
    this.charState = state;
    this.charState.onInputChange();
  }

  public addToWorld(world: World) {
    this.world = world;

    world.physicsWorld.addBody(this.characterCapsule.body);

    world.scene.add(this);
    world.scene.add(this.raycastBox);
  }

  public removeFromWorld(world: World) {}

  public update(delta: number) {
    this.charState?.update(delta);

    if (this.physicsEnabled) this.springMovement(delta);
    if (this.physicsEnabled) this.springRotation(delta);
    if (this.physicsEnabled) this.rotateModel();
    if (this.mixer !== undefined) this.mixer.update(delta);

    if (this.physicsEnabled) {
      this.position.set(
        this.characterCapsule.body.interpolatedPosition.x,
        this.characterCapsule.body.interpolatedPosition.y,
        this.characterCapsule.body.interpolatedPosition.z
      );
    }
  }

  public setPosition(x: number, y: number, z: number) {
    if (this.physicsEnabled) {
      this.characterCapsule.body.previousPosition = new CANNON.Vec3(x, y, z);
      this.characterCapsule.body.position = new CANNON.Vec3(x, y, z);
      this.characterCapsule.body.interpolatedPosition = new CANNON.Vec3(
        x,
        y,
        z
      );
    } else {
      this.position.x = x;
      this.position.y = y;
      this.position.z = z;
    }
  }

  public springMovement(delta: number) {
    this.velocitySimulator.target.copy(this.velocityTarget);
    this.velocitySimulator.simulate(delta);

    this.velocity.copy(this.velocitySimulator.position);
    this.acceleration.copy(this.velocitySimulator.velocity);
  }

  public springRotation(delta: number) {
    const angle = Utils.getSignedAngleBetweenVectors(
      this.orientation,
      this.orientationTarget
    );

    this.rotationSimulator.target = angle;
    this.rotationSimulator.simulate(delta);
    const rot = this.rotationSimulator.position;

    this.orientation.applyAxisAngle(new THREE.Vector3(0, 1, 0), rot);
    this.angularVelocity = this.rotationSimulator.velocity;
  }

  public rotateModel() {
    this.lookAt(
      this.position.x + this.orientation.x,
      this.position.y + this.orientation.y,
      this.position.z + this.orientation.z
    );
    this.tiltContainer.rotation.z =
      -this.angularVelocity * 2.3 * this.velocity.length();
    this.tiltContainer.position.setY(
      Math.cos(Math.abs(this.angularVelocity * 2.3 * this.velocity.length())) /
        2 -
        0.5
    );
  }

  public setOrientation(vector: THREE.Vector3, instantly = false): void {
    const lookVector = new THREE.Vector3().copy(vector).setY(0).normalize();
    this.orientationTarget.copy(lookVector);

    if (instantly) {
      this.orientation.copy(lookVector);
    }
  }

  public physicsPreStep() {
    this.feetRaycast();

    if (this.rayHasHit) {
      if (this.raycastBox.visible) {
        this.raycastBox.position.x = this.rayResult.hitPointWorld.x;
        this.raycastBox.position.y = this.rayResult.hitPointWorld.y;
        this.raycastBox.position.z = this.rayResult.hitPointWorld.z;
      }
    } else {
      if (this.raycastBox.visible) {
        this.raycastBox.position.set(
          this.characterCapsule.body.position.x,
          this.characterCapsule.body.position.y -
            this.rayCastLength -
            this.raySafeOffset,
          this.characterCapsule.body.position.z
        );
      }
    }
  }

  public feetRaycast() {
    const body = this.characterCapsule.body;
    const start = new CANNON.Vec3(
      body.position.x,
      body.position.y,
      body.position.z
    );
    const end = new CANNON.Vec3(
      body.position.x,
      body.position.y - this.rayCastLength - this.raySafeOffset,
      body.position.z
    );
    const rayCastOptions = {
      collisionFilterMask: CollisionGroups.Default, // 어떤 collisionGroup 이랑 반응할것인지
      skipBackfaces: true /* ignore back faces */,
    };
    this.rayHasHit = this.world.physicsWorld.raycastClosest(
      start,
      end,
      rayCastOptions,
      this.rayResult
    );
  }

  public physicsPostStep(): void {
    const newVelocity = new THREE.Vector3();

    if (this.rayHasHit) {
      newVelocity.y = 0;
      // TODO: Move on top of moving objects

      // Measure the normal vector offset from direct "up" vector
      // and transform it into a matrix
      const up = new THREE.Vector3(0, 1, 0);
      const normal = new THREE.Vector3(
        this.rayResult.hitNormalWorld.x,
        this.rayResult.hitNormalWorld.y,
        this.rayResult.hitNormalWorld.z
      );
      const q = new THREE.Quaternion().setFromUnitVectors(up, normal);
      const m = new THREE.Matrix4().makeRotationFromQuaternion(q);
      // Rotate the velocity vector
      newVelocity.applyMatrix4(m);
      // Compensate for gravity
      // newVelocity.y -= body.world.physicsWorld.gravity.y / body.character.world.physicsFrameRate;
      // Apply velocity
      this.characterCapsule.body.velocity.x = newVelocity.x;
      this.characterCapsule.body.velocity.y = newVelocity.y;
      this.characterCapsule.body.velocity.z = newVelocity.z;
      // Ground character
      this.characterCapsule.body.position.y =
        this.rayResult.hitPointWorld.y +
        this.rayCastLength +
        newVelocity.y / 60;
    } else {
      // If we're in air
      this.characterCapsule.body.velocity.x = newVelocity.x;
      this.characterCapsule.body.velocity.y = newVelocity.y;
      this.characterCapsule.body.velocity.z = newVelocity.z;
    }
  }

  public takeControl(): void {
    if (this.world !== undefined) {
      this.world.inputManager.setInputReceiver(this);
    } else {
      console.warn(
        "Attempting to take control of a character that doesn't belong to a world."
      );
    }
  }

  public triggerAction(actionName: string, value: boolean) {
    const action = this.actions[actionName];

    if (action.isPressed !== value) {
      // Set value
      action.isPressed = value;

      // Reset the 'just' attributes
      action.justPressed = false;
      action.justReleased = false;

      // Set the 'just' attributes
      if (value) action.justPressed = true;
      else action.justReleased = true;

      // Tell player to handle states according to new input
      this.charState.onInputChange();

      // Reset the 'just' attributes
      action.justPressed = false;
      action.justReleased = false;
    }
  }

  public resetControls(): void {
    for (const action in this.actions) {
      if (this.actions.hasOwnProperty(action)) {
        this.triggerAction(action, false);
      }
    }
  }

  handleKeyboardEvent(event: KeyboardEvent, code: string, pressed: boolean) {
    // Free camera
    if (code === "KeyC" && pressed === true && event.shiftKey === true) {
      this.resetControls();
      this.world.cameraOperator.characterCaller = this;
      this.world.inputManager.setInputReceiver(this.world.cameraOperator);
    } else {
      for (const action in this.actions) {
        if (this.actions.hasOwnProperty(action)) {
          const binding = this.actions[action];

          if (_.includes(binding.eventCodes, code)) {
            this.triggerAction(action, pressed);
          }
        }
      }
    }
  }
  handleMouseButton(event: MouseEvent, code: string, pressed: boolean) {}
  handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number) {}
  handleMouseWheel(event: WheelEvent, value: number) {}

  inputReceiverInit() {
    this.world.cameraOperator.setRadius(1.6, true);
  }
  inputReceiverUpdate(delta: number) {
    // Look in camera's direction
    this.viewVector = new THREE.Vector3().subVectors(
      this.position,
      this.world.camera.position
    );
    this.getWorldPosition(this.world.cameraOperator.target);
  }

  public setAnimations(animations: []): void {
    this.animations = animations;
  }

  public setAnimation(clipName: string, fadeIn: number): number {
    if (this.mixer !== undefined) {
      const clip = THREE.AnimationClip.findByName(this.animations, clipName);
      const action = this.mixer.clipAction(clip);
      if (action === null) {
        console.error(`Animation ${clipName} not found!`);
        return 0;
      }

      action.reset();
      action.play();
      if (this.oldAction) {
        action.crossFadeFrom(this.oldAction, fadeIn, true);
      }
      this.oldAction = action;

      return action.getClip().duration;
    }
    return 0;
  }

  public setArcadeVelocityTarget(
    velZ: number,
    velX: number = 0,
    velY: number = 0
  ): void {
    this.velocityTarget.z = velZ;
    this.velocityTarget.x = velX;
    this.velocityTarget.y = velY;
  }

  public getLocalMovementDirection(): THREE.Vector3 {
    const positiveX = this.actions.right.isPressed ? -1 : 0;
    const negativeX = this.actions.left.isPressed ? 1 : 0;
    const positiveZ = this.actions.up.isPressed ? 1 : 0;
    const negativeZ = this.actions.down.isPressed ? -1 : 0;

    return new THREE.Vector3(
      positiveX + negativeX,
      0,
      positiveZ + negativeZ
    ).normalize();
  }

  public getCameraRelativeMovementVector(): THREE.Vector3 {
    const localDirection = this.getLocalMovementDirection();
    const flatViewVector = new THREE.Vector3(
      this.viewVector.x,
      0,
      this.viewVector.z
    ).normalize();

    return Utils.appplyVectorMatrixXZ(flatViewVector, localDirection);
  }

  public setCameraRelativeOrientationTarget() {
    const moveVector = this.getCameraRelativeMovementVector();

    if (moveVector.x === 0 && moveVector.y === 0 && moveVector.z === 0) {
      this.setOrientation(this.orientation);
    } else {
      this.setOrientation(moveVector);
    }
  }
}
