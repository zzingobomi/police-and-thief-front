import { VehicleSeat } from "../../../vehicles/VehicleSeat";
import { CharacterStateBase } from "../CharacterStateBase";
import { Character } from "../../Character";
import { StateType } from "../../../enums/StateType";
import * as THREE from "three";
import * as Utils from "../../../utils/FunctionLibrary";
import { Space } from "../../../enums/Space";
import { Side } from "../../../enums/Side";
import { SeatType } from "../../../enums/SeatType";

export class SwitchingSeats extends CharacterStateBase {
  private toSeat: VehicleSeat;

  private startPosition: THREE.Vector3 = new THREE.Vector3();
  private endPosition: THREE.Vector3 = new THREE.Vector3();
  private startRotation: THREE.Quaternion = new THREE.Quaternion();
  private endRotation: THREE.Quaternion = new THREE.Quaternion();

  constructor(
    character: Character,
    fromSeat: VehicleSeat,
    toSeat: VehicleSeat
  ) {
    super(character, StateType.SwitchingSeats);

    this.toSeat = toSeat;
    this.canFindVehiclesToEnter = false;
    this.canLeaveVehicles = false;

    character.leaveSeat();
    this.character.occupySeat(toSeat);

    // 외적이 아닌 내적으로 좌우를 판별했네? right 벡터를 구한뒤 앞뒤를 판별하듯이 한듯..
    const right = Utils.getRight(fromSeat.seatPointObject, Space.Local);
    const viewVector = toSeat.seatPointObject.position
      .clone()
      .sub(fromSeat.seatPointObject.position)
      .normalize();
    const side = right.dot(viewVector) > 0 ? Side.Left : Side.Right;

    if (side === Side.Left) {
      this.playAnimation("sitting_shift_left", 0.1);
    } else if (side === Side.Right) {
      this.playAnimation("sitting_shift_right", 0.1);
    }

    this.startPosition.copy(fromSeat.seatPointObject.position);
    this.startPosition.y += 0.6;
    this.endPosition.copy(toSeat.seatPointObject.position);
    this.endPosition.y += 0.6;

    this.startRotation.copy(fromSeat.seatPointObject.quaternion);
    this.endRotation.copy(toSeat.seatPointObject.quaternion);
  }

  public update(timeStep: number): void {
    super.update(timeStep);

    if (this.animationEnded(timeStep)) {
      if (this.toSeat.type === SeatType.Driver) {
        this.character.setState(
          Utils.characterStateFactory(
            StateType.Driving,
            this.character,
            this.toSeat
          )
        );
      } else if (this.toSeat.type === SeatType.Passenger) {
        this.character.setState(
          Utils.characterStateFactory(
            StateType.Sitting,
            this.character,
            this.toSeat
          )
        );
      }
    } else {
      const factor = this.timer / this.animationLength;
      const sineFactor = Utils.easeInOutSine(factor);

      const lerpPosition = new THREE.Vector3().lerpVectors(
        this.startPosition,
        this.endPosition,
        sineFactor
      );
      this.character.setPosition(
        lerpPosition.x,
        lerpPosition.y,
        lerpPosition.z
      );

      this.character.quaternion.slerpQuaternions(
        this.startRotation,
        this.endRotation,
        sineFactor
      );
    }
  }
}
