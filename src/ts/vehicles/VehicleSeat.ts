import { IControllable } from "../interfaces/IControllable";
import * as THREE from "three";

export class VehicleSeat {
  public vehicle: IControllable;
  public seatPointObject: THREE.Object3D;

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
      }
    }
  }
}
