import { Euler, Vector3 } from "three";
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

  get Scale() {
    return this.gameObject.scale;
  }
  set Scale(scale: THREE.Vector3) {
    this.gameObject.scale.set(scale.x, scale.y, scale.z);
  }
}
