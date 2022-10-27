import * as THREE from "three";
import { Vehicle } from "./Vehicle";
import { VehicleSeat } from "./VehicleSeat";

export class VehicleDoor {
  public vehicle: Vehicle;
  public seat: VehicleSeat;
  public doorObject: THREE.Object3D;
  public doorWorldPos: THREE.Vector3 = new THREE.Vector3();
  public lastTrailerPos: THREE.Vector3 = new THREE.Vector3();
  public lastTrailerVel: THREE.Vector3 = new THREE.Vector3();

  constructor(seat: VehicleSeat, object: THREE.Object3D) {
    this.seat = seat;
    this.vehicle = seat.vehicle as unknown as Vehicle;
    this.doorObject = object;
  }

  public update(timestep: number) {}

  public open() {
    console.log("open");
  }

  public close() {
    console.log("close");
  }
}
