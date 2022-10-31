import * as THREE from "three";
import * as _ from "lodash";
import * as Utils from "../utils/FunctionLibrary";
import { IWorldEntity } from "../interfaces/IWorldEntity";
import { EntityType } from "../enums/EntityType";
import { World } from "../world/World";
import { Character } from "../characters/Character";
import { GLTF } from "three-stdlib";

export abstract class Vehicle extends THREE.Object3D implements IWorldEntity {
  public updateOrder: number = 2;
  public abstract entityType: EntityType;

  public controllingCharacter: Character;
  public world: World | undefined;

  private modelContainer: THREE.Group;

  public serverPosition: THREE.Vector3;
  public serverQuaternion: THREE.Quaternion;
  public serverScale: THREE.Vector3;

  constructor(gltf: GLTF) {
    super();

    this.modelContainer = new THREE.Group();
    this.add(this.modelContainer);
    this.modelContainer.add(gltf.scene);

    this.serverPosition = new THREE.Vector3();
    this.serverQuaternion = new THREE.Quaternion();
    this.serverScale = new THREE.Vector3();
  }

  addToWorld(world: World): void {
    this.world = world;
    world.vehicles.push(this);
    world.scene.add(this);
  }
  removeFromWorld(world: World): void {
    if (!_.includes(world.vehicles, this)) {
      console.warn(
        "Removing character from a world in which it isn't present."
      );
    } else {
      this.world = undefined;
      _.pull(world.vehicles, this);
    }
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

  public setOnChange(vehicleUpdator: any) {
    vehicleUpdator.position.onChange = (changes: any) => {
      this.setServerPosition(
        vehicleUpdator.position.x,
        vehicleUpdator.position.y,
        vehicleUpdator.position.z
      );
    };
    vehicleUpdator.quaternion.onChange = (changes: any) => {
      this.setServerQuaternion(
        vehicleUpdator.quaternion.x,
        vehicleUpdator.quaternion.y,
        vehicleUpdator.quaternion.z,
        vehicleUpdator.quaternion.w
      );
    };
    vehicleUpdator.scale.onChange = (changes: any) => {
      this.setServerScale(
        vehicleUpdator.scale.x,
        vehicleUpdator.scale.y,
        vehicleUpdator.scale.z
      );
    };
  }

  update(delta: number): void {
    this.position.copy(
      Utils.lerpVector(this.position, this.serverPosition, 0.1)
    );
    this.quaternion.copy(
      Utils.lerpQuaternion(this.quaternion, this.serverQuaternion, 0.1)
    );
  }

  handleKeyboardEvent(
    event: KeyboardEvent,
    code: string,
    pressed: boolean
  ): void {
    //
  }
  handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void {
    //
  }
  handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void {
    //
  }
  handleMouseWheel(event: WheelEvent, value: number): void {
    //
  }
  inputReceiverInit(): void {
    //
  }
  inputReceiverUpdate(delta: number): void {
    //
  }
}
