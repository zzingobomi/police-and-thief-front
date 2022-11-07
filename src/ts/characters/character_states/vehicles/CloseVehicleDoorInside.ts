import { VehicleSeat } from "../../../vehicles/VehicleSeat";
import { Character } from "../../Character";
import { CharacterStateBase } from "../CharacterStateBase";
import { StateType } from "../../../enums/StateType";
import * as Utils from "../../../utils/FunctionLibrary";
import { Side } from "../../../enums/Side";
import { SeatType } from "../../../enums/SeatType";

export class CloseVehicleDoorInside extends CharacterStateBase {
  private seat: VehicleSeat;
  private hasClosedDoor: boolean = false;

  constructor(character: Character, seat: VehicleSeat) {
    super(character, StateType.CloseVehicleDoorInside);

    this.seat = seat;
    this.canFindVehiclesToEnter = false;
    this.canLeaveVehicles = false;

    const side = Utils.detectRelativeSide(
      seat.seatPointObject,
      seat.door.doorObject
    );
    if (side === Side.Left) {
      this.playAnimation("close_door_sitting_left", 0.1);
    } else if (side === Side.Right) {
      this.playAnimation("close_door_sitting_right", 0.1);
    }

    this.seat.door?.open();
  }

  public update(timeStep: number) {
    super.update(timeStep);

    if (this.timer > 0.4 && !this.hasClosedDoor) {
      this.hasClosedDoor = true;
      this.seat.door?.close();
    }

    if (this.animationEnded(timeStep)) {
      if (this.seat.type === SeatType.Driver) {
        this.character.setState(
          Utils.characterStateFactory(
            StateType.Driving,
            this.character,
            this.seat
          )
        );
      } else if (this.seat.type === SeatType.Passenger) {
        this.character.setState(
          Utils.characterStateFactory(
            StateType.Sitting,
            this.character,
            this.seat
          )
        );
      }
    }
  }
}
