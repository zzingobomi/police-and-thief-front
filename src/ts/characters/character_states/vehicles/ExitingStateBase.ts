import { IControllable } from "../../../interfaces/IControllable";
import { VehicleSeat } from "../../../vehicles/VehicleSeat";
import { CharacterStateBase } from "../CharacterStateBase";
import * as THREE from "three";
import { Character } from "../../Character";

export abstract class ExitingStateBase extends CharacterStateBase {
  protected vehicle: IControllable;
  protected seat: VehicleSeat;
  protected startPosition: THREE.Vector3 = new THREE.Vector3();
  protected endPosition: THREE.Vector3 = new THREE.Vector3();
  protected startRotation: THREE.Quaternion = new THREE.Quaternion();
  protected endRotation: THREE.Quaternion = new THREE.Quaternion();
  protected exitPoint: THREE.Object3D;
  protected dummyObj: THREE.Object3D;

  constructor(character: Character, seat: VehicleSeat, name: string) {
    super(character, name);
  }
}
