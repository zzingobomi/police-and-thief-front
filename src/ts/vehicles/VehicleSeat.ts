import { IControllable } from "../interfaces/IControllable";
import * as THREE from "three";
import { Vector3 } from "three";

export class VehicleSeat {
  public vehicle: IControllable;
  public seatPointObject: THREE.Object3D;

  public entryPoints: THREE.Object3D[] = [];

  public pointBox: THREE.Mesh;

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

    // entryPoint debug
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const boxMat = new THREE.MeshLambertMaterial({
      color: 0xffff00,
    });
    this.pointBox = new THREE.Mesh(boxGeo, boxMat);
    this.pointBox.visible = true;

    for (const p of this.entryPoints) {
      const worldP = new THREE.Vector3();
      p.getWorldPosition(worldP);
      this.pointBox.position.set(worldP.x, worldP.y, worldP.z);
    }
  }
}
