import { StateType } from "../../../enums/StateType";
import { VehicleSeat } from "../../../vehicles/VehicleSeat";
import { Character } from "../../Character";
import { ExitingStateBase } from "./ExitingStateBase";

export class ExitingVehicle extends ExitingStateBase {
  constructor(character: Character, seat: VehicleSeat) {
    super(character, seat, StateType.ExitingVehicle);
  }
}
