import { StateType } from "../../../enums/StateType";
import { VehicleSeat } from "../../../vehicles/VehicleSeat";
import { Character } from "../../Character";
import { CharacterStateBase } from "../CharacterStateBase";

export class CloseVehicleDoorOutside extends CharacterStateBase {
  private seat: VehicleSeat;
  private hasClosedDoor: boolean = false;

  constructor(character: Character, seat: VehicleSeat) {
    super(character, StateType.CloseVehicleDoorOutside);
  }
}
