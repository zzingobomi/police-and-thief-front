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

export class Character extends THREE.Object3D implements IWorldEntity {
  public updateOrder = 1;
  public entityType: EntityType = EntityType.Character;

  public height = 0;
  public tiltContainer: THREE.Group;
  public modelContainer: THREE.Group;
  public mixer: THREE.AnimationMixer;
  public oldAction: THREE.AnimationAction;
  public animations: any[];

  public viewOldVector: THREE.Vector3;
  public viewVector: THREE.Vector3;
  public actions: { [action: string]: KeyBinding };

  public world: World;
  public charState: ICharacterState;

  public serverPosition: THREE.Vector3;
  public serverQuaternion: THREE.Quaternion;
  public serverScale: THREE.Vector3;

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

    this.viewOldVector = new THREE.Vector3();
    this.viewVector = new THREE.Vector3();

    this.serverPosition = new THREE.Vector3();
    this.serverQuaternion = new THREE.Quaternion();
    this.serverScale = new THREE.Vector3();

    this.setState(new Idle(this));
  }

  public setState(state: ICharacterState): void {
    this.charState = state;
    this.charState.onInputChange();
  }

  public addToWorld(world: World) {
    this.world = world;
    world.scene.add(this);
  }

  public removeFromWorld(world: World) {}

  public update(delta: number) {
    this.charState?.update(delta);

    if (this.mixer !== undefined) this.mixer.update(delta);

    this.position.copy(
      Utils.lerpVector(this.position, this.serverPosition, 0.1)
    );
    this.quaternion.copy(
      Utils.lerpQuaternion(this.quaternion, this.serverQuaternion, 0.1)
    );
  }

  public setPosition(x: number, y: number, z: number) {
    this.position.x = x;
    this.position.y = y;
    this.position.z = z;
  }
  public setServerPosition(x: number, y: number, z: number) {
    this.serverPosition.x = x;
    this.serverPosition.y = y;
    this.serverPosition.z = z;
  }

  public setQuaternion(x: number, y: number, z: number, w: number) {
    this.quaternion.x = x;
    this.quaternion.y = y;
    this.quaternion.z = z;
    this.quaternion.w = w;
  }
  public setServerQuaternion(x: number, y: number, z: number, w: number) {
    this.serverQuaternion.x = x;
    this.serverQuaternion.y = y;
    this.serverQuaternion.z = z;
    this.serverQuaternion.w = w;
  }

  public setScale(x: number, y: number, z: number) {
    this.scale.x = x;
    this.scale.y = y;
    this.scale.z = z;
  }
  public setServerScale(x: number, y: number, z: number) {
    this.serverScale.x = x;
    this.serverScale.y = y;
    this.serverScale.z = z;
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

  handleKeyboardEvent(event: KeyboardEvent, code: string, pressed: boolean) {
    // Free camera
    if (code === "KeyC" && pressed === true && event.shiftKey === true) {
      this.world.cameraOperator.characterCaller = this;
      this.world.inputManager.setInputReceiver(this.world.cameraOperator);
    } else {
      ColyseusStore.getInstance().GetRoom()?.send("key.input", {
        event,
        code,
        pressed,
      });
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

    if (Utils.checkDiffVec(this.viewOldVector, this.viewVector)) {
      this.viewOldVector.copy(this.viewVector);
      ColyseusStore.getInstance()
        .GetRoom()
        ?.send("view.update", Utils.fixedVec3(this.viewVector));
    }
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

  public setOnChange(playerUpdator: any) {
    playerUpdator.position.onChange = (changes: any) => {
      this.setServerPosition(
        playerUpdator.position.x,
        playerUpdator.position.y,
        playerUpdator.position.z
      );
    };
    playerUpdator.quaternion.onChange = (changes: any) => {
      this.setServerQuaternion(
        playerUpdator.quaternion.x,
        playerUpdator.quaternion.y,
        playerUpdator.quaternion.z,
        playerUpdator.quaternion.w
      );
    };
    playerUpdator.scale.onChange = (changes: any) => {
      this.setServerScale(
        playerUpdator.scale.x,
        playerUpdator.scale.y,
        playerUpdator.scale.z
      );
    };

    playerUpdator.onChange = (changes: any) => {
      changes.forEach((change: any) => {
        if (change.field === "stateName") {
          this.setState(
            Utils.characterStateFactory(playerUpdator.stateName, this)
          );
        }
      });
    };
  }
}
