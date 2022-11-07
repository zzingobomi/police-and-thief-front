import { StateType } from "../../../enums/StateType";
import { VehicleSeat } from "../../../vehicles/VehicleSeat";
import { Character } from "../../Character";
import { CharacterStateBase } from "../CharacterStateBase";
import { SeatType } from "../../../enums/SeatType";
import * as Utils from "../../../utils/FunctionLibrary";

export class Sitting extends CharacterStateBase {
  private seat: VehicleSeat;

  constructor(character: Character, seat: VehicleSeat) {
    super(character, StateType.Sitting);

    this.seat = seat;
    this.canFindVehiclesToEnter = false;

    this.playAnimation("sitting", 0.1);
  }

  public update(timeStep: number): void {
    super.update(timeStep);

    if (
      !this.seat.door?.achievingTargetRotation &&
      this.seat.door?.rotation > 0 &&
      this.noDirection()
    ) {
      this.character.setState(
        Utils.characterStateFactory(
          StateType.CloseVehicleDoorInside,
          this.character,
          this.seat
        )
      );
    } else if (this.character.vehicleEntryInstance !== null) {
      if (this.character.vehicleEntryInstance.wantsToDrive) {
        for (const possibleDriverSeat of this.seat.connectedSeats) {
          if (possibleDriverSeat.type === SeatType.Driver) {
            if (this.seat.door?.rotation > 0)
              this.seat.door.physicsEnabled = true;
            this.character.setState(
              Utils.characterStateFactory(
                StateType.SwitchingSeats,
                this.character,
                this.seat,
                possibleDriverSeat
              )
            );
            break;
          }
        }
      } else {
        this.character.vehicleEntryInstance = null;
      }
    }
  }

  public onInputChange() {
    if (
      this.character.actions.seat_switch.justPressed &&
      this.seat.connectedSeats.length > 0
    ) {
      this.character.setState(
        Utils.characterStateFactory(
          StateType.SwitchingSeats,
          this.character,
          this.seat,
          this.seat.connectedSeats[0]
        )
      );
    }

    if (this.character.actions.enter.justPressed) {
      this.character.exitVehicle();
    }
  }
}
