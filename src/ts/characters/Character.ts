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
import { ColyseusStore } from "../../store";
import { ClosestObjectFinder } from "../core/ClosestObjectFinder";
import { Vehicle } from "../vehicles/Vehicle";
import { IControllable } from "../interfaces/IControllable";
import { VehicleSeat } from "../vehicles/VehicleSeat";
import { VehicleEntryInstance } from "./VehicleEntryInstance";
import { SeatType } from "../enums/SeatType";
import { Object3D } from "three";

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
  public arcadeVelocityIsAdditive: boolean = false;

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
  public wantsToJump: boolean = false;
  public initJumpSpeed: number = -1;
  public groundImpactData: THREE.Vector3 = new THREE.Vector3();
  public raycastBox: THREE.Mesh;

  public world: World;
  public charState: ICharacterState;

  // Vehicles
  public controlledObject: IControllable;
  public occupyingSeat: VehicleSeat | null = null;
  public vehicleEntryInstance: VehicleEntryInstance | null = null;

  private physicsEnabled: boolean = true;

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
    this.viewVector = new THREE.Vector3();

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
    //this.raycastBox.visible = false;

    // cannon-es latest version에서는 preStep, postStep 없어짐..
    this.characterCapsule.body.preStep = () => {
      this.physicsPreStep();
    };
    this.characterCapsule.body.postStep = () => {
      this.physicsPostStep();
    };

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

  public resetControls(): void {
    for (const action in this.actions) {
      if (this.actions.hasOwnProperty(action)) {
        this.triggerAction(action, false);
      }
    }
  }

  public update(delta: number) {
    this.vehicleEntryInstance?.update(delta);
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
    } else {
      const newPos = new THREE.Vector3();
      this.getWorldPosition(newPos);

      this.characterCapsule.body.position.copy(
        Utils.three2cannonVector(newPos)
      );
      this.characterCapsule.body.interpolatedPosition.copy(
        Utils.three2cannonVector(newPos)
      );
    }

    this.updateMatrixWorld();
  }

  public springMovement(timeStep: number): void {
    // Simulator
    this.velocitySimulator.target.copy(this.velocityTarget);
    this.velocitySimulator.simulate(timeStep);

    // Update values
    this.velocity.copy(this.velocitySimulator.position);
    this.acceleration.copy(this.velocitySimulator.velocity);
  }

  public springRotation(timeStep: number): void {
    // Spring rotation
    // Figure out angle between current and target orientation
    let angle = Utils.getSignedAngleBetweenVectors(
      this.orientation,
      this.orientationTarget
    );

    // Simulator
    this.rotationSimulator.target = angle;
    this.rotationSimulator.simulate(timeStep);
    let rot = this.rotationSimulator.position;

    // Updating values
    this.orientation.applyAxisAngle(new THREE.Vector3(0, 1, 0), rot);
    this.angularVelocity = this.rotationSimulator.velocity;
  }

  public rotateModel(): void {
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
  public setQuaternion(x: number, y: number, z: number, w: number) {
    this.quaternion.x = x;
    this.quaternion.y = y;
    this.quaternion.z = z;
    this.quaternion.w = w;
  }
  public setScale(x: number, y: number, z: number) {
    this.scale.x = x;
    this.scale.y = y;
    this.scale.z = z;
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
    const simulatedVelocity = new THREE.Vector3(
      this.characterCapsule.body.velocity.x,
      this.characterCapsule.body.velocity.y,
      this.characterCapsule.body.velocity.z
    );

    let arcadeVelocity = new THREE.Vector3()
      .copy(this.velocity)
      .multiplyScalar(this.moveSpeed);
    arcadeVelocity = Utils.appplyVectorMatrixXZ(
      this.orientation,
      arcadeVelocity
    );

    let newVelocity = new THREE.Vector3();

    // Falling, JumpRunning 외에는 항상 false임..
    if (this.arcadeVelocityIsAdditive) {
      newVelocity.copy(simulatedVelocity);

      let globalVelocityTarget = Utils.appplyVectorMatrixXZ(
        this.orientation,
        this.velocityTarget
      );
      let add = new THREE.Vector3()
        .copy(arcadeVelocity)
        .multiply(this.arcadeVelocityInfluence);

      if (
        Math.abs(simulatedVelocity.x) <
          Math.abs(globalVelocityTarget.x * this.moveSpeed) ||
        Utils.haveDifferentSigns(simulatedVelocity.x, arcadeVelocity.x)
      ) {
        newVelocity.x += add.x;
      }
      if (
        Math.abs(simulatedVelocity.y) <
          Math.abs(globalVelocityTarget.y * this.moveSpeed) ||
        Utils.haveDifferentSigns(simulatedVelocity.y, arcadeVelocity.y)
      ) {
        newVelocity.y += add.y;
      }
      if (
        Math.abs(simulatedVelocity.z) <
          Math.abs(globalVelocityTarget.z * this.moveSpeed) ||
        Utils.haveDifferentSigns(simulatedVelocity.z, arcadeVelocity.z)
      ) {
        newVelocity.z += add.z;
      }
    } else {
      newVelocity = new THREE.Vector3(
        THREE.MathUtils.lerp(
          simulatedVelocity.x,
          arcadeVelocity.x,
          this.arcadeVelocityInfluence.x
        ),
        THREE.MathUtils.lerp(
          simulatedVelocity.y,
          arcadeVelocity.y,
          this.arcadeVelocityInfluence.y
        ),
        THREE.MathUtils.lerp(
          simulatedVelocity.z,
          arcadeVelocity.z,
          this.arcadeVelocityInfluence.z
        )
      );
    }

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

      this.groundImpactData.x = this.characterCapsule.body.velocity.x;
      this.groundImpactData.y = this.characterCapsule.body.velocity.y;
      this.groundImpactData.z = this.characterCapsule.body.velocity.z;
    }

    // Jumping
    if (this.wantsToJump) {
      // If initJumpSpeed is set
      if (this.initJumpSpeed > -1) {
        // Flatten velocity
        this.characterCapsule.body.velocity.y = 0;
        let speed = Math.max(
          this.velocitySimulator.position.length() * 4,
          this.initJumpSpeed
        );
        this.characterCapsule.body.velocity = Utils.three2cannonVector(
          this.orientation.clone().multiplyScalar(speed)
        );
      } else {
        // Moving objects compensation
        let add = new CANNON.Vec3();
        this.rayResult.body?.getVelocityAtWorldPoint(
          this.rayResult.hitPointWorld,
          add
        );
        this.characterCapsule.body.velocity.vsub(
          add,
          this.characterCapsule.body.velocity
        );
      }

      // Add positive vertical velocity
      this.characterCapsule.body.velocity.y += 4;
      // Move above ground by 2x safe offset value
      this.characterCapsule.body.position.y += this.raySafeOffset * 2;
      // Reset flag
      this.wantsToJump = false;
    }
  }

  public triggerAction(actionName: string, value: boolean): void {
    // Get action and set it's parameters
    let action = this.actions[actionName];

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

  public takeControl(): void {
    if (this.world !== undefined) {
      this.world.inputManager.setInputReceiver(this);
    } else {
      console.warn(
        "Attempting to take control of a character that doesn't belong to a world."
      );
    }
  }

  public setArcadeVelocityInfluence(
    x: number,
    y: number = x,
    z: number = x
  ): void {
    this.arcadeVelocityInfluence.set(x, y, z);
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

  public resetVelocity(): void {
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.velocity.z = 0;

    this.characterCapsule.body.velocity.x = 0;
    this.characterCapsule.body.velocity.y = 0;
    this.characterCapsule.body.velocity.z = 0;

    this.velocitySimulator.init();
  }

  handleKeyboardEvent(event: KeyboardEvent, code: string, pressed: boolean) {
    // Free camera
    if (code === "KeyC" && pressed === true && event.shiftKey === true) {
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
  handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number) {
    this.world.cameraOperator.move(deltaX, deltaY);
  }
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
    if (this.vehicleEntryInstance === null) {
      const moveVector = this.getCameraRelativeMovementVector();

      if (moveVector.x === 0 && moveVector.y === 0 && moveVector.z === 0) {
        this.setOrientation(this.orientation);
      } else {
        this.setOrientation(moveVector);
      }
    }
  }

  public setOrientation(vector: THREE.Vector3, instantly = false): void {
    const lookVector = new THREE.Vector3().copy(vector).setY(0).normalize();
    this.orientationTarget.copy(lookVector);

    if (instantly) {
      this.orientation.copy(lookVector);
    }
  }

  public setPhysicsEnabled(value: boolean) {
    this.physicsEnabled = value;

    if (value === true) {
      this.world.physicsWorld.addBody(this.characterCapsule.body);
    } else {
      this.world.physicsWorld.removeBody(this.characterCapsule.body);
    }
  }

  public jump(initJumpSpeed: number = -1): void {
    this.wantsToJump = true;
    this.initJumpSpeed = initJumpSpeed;
  }

  public findVehicleToEnter(wantsToDrive: boolean) {
    let worldPos = new THREE.Vector3();

    // Find best vehicle
    const vehicleFinder = new ClosestObjectFinder<Vehicle>(this.position, 10);
    this.world.vehicles.forEach((vehicle) => {
      vehicleFinder.consider(vehicle, vehicle.position);
    });

    if (vehicleFinder.closestObject !== undefined) {
      const vehicle = vehicleFinder.closestObject;
      const vehicleEntryInstance = new VehicleEntryInstance(this);
      vehicleEntryInstance.wantsToDrive = wantsToDrive;

      // Find best seat
      const seatFinder = new ClosestObjectFinder<VehicleSeat>(this.position);
      for (const seat of vehicle.seats) {
        if (wantsToDrive) {
          // Consider driver seats
          if (seat.type === SeatType.Driver) {
            seat.seatPointObject.getWorldPosition(worldPos);
            seatFinder.consider(seat, worldPos);
          }
          // Consider passenger seats connected to driver seats
          else if (seat.type === SeatType.Passenger) {
            for (const connSeat of seat.connectedSeats) {
              if (connSeat.type === SeatType.Driver) {
                seat.seatPointObject.getWorldPosition(worldPos);
                seatFinder.consider(seat, worldPos);
                break;
              }
            }
          }
        } else {
          // Consider passenger seats
          if (seat.type === SeatType.Passenger) {
            seat.seatPointObject.getWorldPosition(worldPos);
            seatFinder.consider(seat, worldPos);
          }
        }
      }

      if (seatFinder.closestObject !== undefined) {
        const targetSeat = seatFinder.closestObject;
        vehicleEntryInstance.targetSeat = targetSeat;

        const entryPointFinder = new ClosestObjectFinder<Object3D>(
          this.position
        );

        for (const point of targetSeat.entryPoints) {
          point.getWorldPosition(worldPos);
          entryPointFinder.consider(point, worldPos);
        }

        if (entryPointFinder.closestObject !== undefined) {
          vehicleEntryInstance.entryPoint = entryPointFinder.closestObject;
          this.triggerAction("up", true);
          this.vehicleEntryInstance = vehicleEntryInstance;
        }
      }
    }
  }

  public enterVehicle(seat: VehicleSeat, entryPoint: THREE.Object3D) {
    this.resetControls();

    //if (seat.door?.rotation < 0.5) {

    //}
  }
}
