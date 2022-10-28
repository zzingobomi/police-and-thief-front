import { GLTF } from "three-stdlib";
import { KeyBinding } from "../core/KeyBinding";
import { EntityType } from "../enums/EntityType";
import { IControllable } from "../interfaces/IControllable";
import { Vehicle } from "./Vehicle";

export class Car extends Vehicle implements IControllable {
  public entityType: EntityType = EntityType.Car;

  actions: { [action: string]: KeyBinding };

  constructor(gltf: GLTF) {
    super(gltf, {
      radius: 0.25,
      suspensionStiffness: 20,
      suspensionRestLength: 0.35,
      maxSuspensionTravel: 1,
      frictionSlip: 0.8,
      dampingRelaxation: 2,
      dampingCompression: 2,
      rollInfluence: 0.8,
    });

    this.actions = {
      throttle: new KeyBinding("KeyW"),
      reverse: new KeyBinding("KeyS"),
      brake: new KeyBinding("Space"),
      left: new KeyBinding("KeyA"),
      right: new KeyBinding("KeyD"),
      exitVehicle: new KeyBinding("KeyF"),
      seat_switch: new KeyBinding("KeyX"),
      view: new KeyBinding("KeyV"),
    };
  }

  public update(timeStep: number): void {
    super.update(timeStep);
  }

  public noDirectionPressed(): boolean {
    let result =
      !this.actions.throttle.isPressed &&
      !this.actions.reverse.isPressed &&
      !this.actions.left.isPressed &&
      !this.actions.right.isPressed;

    return result;
  }
}
