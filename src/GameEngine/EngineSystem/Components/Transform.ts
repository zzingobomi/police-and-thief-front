import { Euler, Quaternion, Vector3 } from "three";
import { Component } from "../Component";

export class Transform extends Component {
  public GetPosition() {
    return this.gameObject.position;
  }
  public SetPosition(x: number, y: number, z: number) {
    this.gameObject.position.set(x, y, z);
  }

  public GetRotation() {
    return this.gameObject.rotation;
  }
  public SetRotation(x: number, y: number, z: number) {
    this.gameObject.rotation.set(x, y, z);
  }

  public GetQuaternion() {
    return this.gameObject.quaternion;
  }
  public SetQuaternion(x: number, y: number, z: number, w: number) {
    this.gameObject.quaternion.set(x, y, z, w);
  }

  public GetScale() {
    return this.gameObject.scale;
  }
  public SetScale(x: number, y: number, z: number) {
    this.gameObject.scale.set(x, y, z);
  }

  get Position() {
    return this.gameObject.position;
  }
  set Position(position: THREE.Vector3) {
    this.gameObject.position.set(position.x, position.y, position.z);
  }

  get Rotation() {
    return this.gameObject.rotation;
  }
  set Rotation(rotation: Euler) {
    this.gameObject.rotation.set(rotation.x, rotation.y, rotation.z);
  }

  get Quaternion() {
    return this.gameObject.quaternion;
  }
  set Quaternion(quaternion: Quaternion) {
    this.gameObject.quaternion.set(
      quaternion.x,
      quaternion.y,
      quaternion.z,
      quaternion.w
    );
  }

  get Scale() {
    return this.gameObject.scale;
  }
  set Scale(scale: THREE.Vector3) {
    this.gameObject.scale.set(scale.x, scale.y, scale.z);
  }
}
