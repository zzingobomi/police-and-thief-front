import { GLTF } from "three-stdlib";
import { KeyBinding } from "../core/KeyBinding";
import { EntityType } from "../enums/EntityType";
import { IControllable } from "../interfaces/IControllable";
import { Vehicle } from "./Vehicle";

export class Car extends Vehicle implements IControllable {
  public entityType: EntityType = EntityType.Car;

  actions: { [action: string]: KeyBinding };

  constructor(gltf: GLTF) {
    super(gltf);
  }
}
