import { StateType } from "../../../enums/StateType";
//import { VehicleSeat } from "../../../vehicles/VehicleSeat";
import { Character } from "../../Character";
import { CharacterStateBase } from "../CharacterStateBase";

export class Sitting extends CharacterStateBase {
  //private seat: VehicleSeat;

  constructor(character: Character) {
    super(character, StateType.Sitting);

    //this.seat = seat;
    //this.canFindVehiclesToEnter = false;

    this.playAnimation("sitting", 0.1);
  }

  public update(timeStep: number): void {
    super.update(timeStep);
  }
}
