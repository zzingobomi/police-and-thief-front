import * as THREE from "three";
import { EntityType } from "../../../enums/EntityType";
import { StateType } from "../../../enums/StateType";
import { IControllable } from "../../../interfaces/IControllable";
import { VehicleSeat } from "../../../vehicles/VehicleSeat";
import { Character } from "../../Character";
import { CharacterStateBase } from "../CharacterStateBase";

export class EnteringVehicle extends CharacterStateBase {
  private vehicle: IControllable;
  private animData: any;
  private seat: VehicleSeat;

  constructor(
    character: Character,
    seat: VehicleSeat,
    entryPoint: THREE.Object3D
  ) {
    super(character, StateType.EnteringVehicle);

    this.canFindVehiclesToEnter = false;
    this.vehicle = seat.vehicle;
    this.seat = seat;
  }

  public update(timeStep: number) {}

  private getEntryAnimations(type: EntityType) {}
}
