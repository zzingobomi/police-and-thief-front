import { StateType } from "../../../enums/StateType";
import { VehicleSeat } from "../../../vehicles/VehicleSeat";
import { Character } from "../../Character";
import { ExitingStateBase } from "./ExitingStateBase";
import * as Utils from "../../../utils/FunctionLibrary";
import * as THREE from "three";
import { Side } from "../../../enums/Side";
import { Vehicle } from "../../../vehicles/Vehicle";

export class ExitingVehicle extends ExitingStateBase {
  constructor(character: Character, seat: VehicleSeat) {
    super(character, seat, StateType.ExitingVehicle);

    this.exitPoint = seat.entryPoints[0];

    this.endPosition.copy(this.exitPoint.position);
    this.endPosition.y += 0.52;

    const side = Utils.detectRelativeSide(seat.seatPointObject, this.exitPoint);
    if (side === Side.Left) {
      this.playAnimation("stand_up_left", 0.1);
    } else if (side === Side.Right) {
      this.playAnimation("stand_up_right", 0.1);
    }
  }

  public update(timeStep: number) {
    super.update(timeStep);

    if (this.animationEnded(timeStep)) {
      this.detachCharacterFromVehicle();

      this.seat.door.physicsEnabled = true;

      if (!this.character.rayHasHit) {
        this.character.setState(
          Utils.characterStateFactory(StateType.Falling, this.character)
        );
        this.character.leaveSeat();
      } else if (
        (this.vehicle as unknown as Vehicle).collision.velocity.length() > 1
      ) {
        this.character.setState(
          Utils.characterStateFactory(StateType.DropRolling, this.character)
        );
        this.character.leaveSeat();
      } else if (this.anyDirection() || this.seat.door === undefined) {
        this.character.setState(
          Utils.characterStateFactory(StateType.Idle, this.character)
        );
        this.character.leaveSeat();
      } else {
        this.character.setState(
          Utils.characterStateFactory(
            StateType.CloseVehicleDoorOutside,
            this.character,
            this.seat
          )
        );
      }
    } else {
      // Door
      if (this.seat.door) {
        this.seat.door.physicsEnabled = false;
      }

      // Position
      let factor = this.timer / this.animationLength;
      let smoothFactor = Utils.easeInOutSine(factor);
      let lerpPosition = new THREE.Vector3().lerpVectors(
        this.startPosition,
        this.endPosition,
        smoothFactor
      );
      this.character.setPosition(
        lerpPosition.x,
        lerpPosition.y,
        lerpPosition.z
      );

      // Rotation
      this.updateEndRotation();
      this.character.quaternion.slerpQuaternions(
        this.startRotation,
        this.endRotation,
        smoothFactor
      );
    }
  }
}
