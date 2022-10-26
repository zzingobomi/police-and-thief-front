import * as THREE from "three";
import { IControllable } from "../interfaces/IControllable";
import { SeatType } from "../enums/SeatType";

export class VehicleSeat {
  public vehicle: IControllable;
  public seatPointObject: THREE.Object3D;

  // 모든 Seat 이 파싱된 후에 실제 인스턴스가 배열에 들어와야 하므로..
  public connectedSeatsString: string;
  public connectedSeats: VehicleSeat[] = [];

  public type: SeatType;
  public entryPoints: THREE.Object3D[] = [];

  constructor(vehicle: IControllable, object: THREE.Object3D, gltf: any) {
    this.vehicle = vehicle;
    this.seatPointObject = object;

    if (
      object.hasOwnProperty("userData") &&
      object.userData.hasOwnProperty("data")
    ) {
      if (object.userData.hasOwnProperty("door_object")) {
        //
      }

      if (object.userData.hasOwnProperty("entry_points")) {
        const entry_points = (object.userData.entry_points as string).split(
          ";"
        );
        for (const entry_point of entry_points) {
          if (entry_point.length > 0) {
            this.entryPoints.push(gltf.scene.getObjectByName(entry_point));
          }
        }
      } else {
        console.error(
          "Seat object " + object + " has no entry point reference property."
        );
      }

      if (object.userData.hasOwnProperty("seat_type")) {
        this.type = object.userData.seat_type;
      } else {
        console.error("Seat object " + object + " has no seat type property.");
      }

      if (object.userData.hasOwnProperty("connected_seats")) {
        this.connectedSeatsString = object.userData.connected_seats;
      }
    }
  }
}
