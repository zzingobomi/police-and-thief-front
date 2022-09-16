import { Component } from "../component";
import * as THREE from "three";
import { Group, PerspectiveCamera, Quaternion, Vector3 } from "three";
import { THREEJS, THREEJS_CONTROLLER } from "../constant";
import { ThreeJSController } from "./threejs-controller";
import { BasicCharacterController } from "./player-entity";

export class ThirdPersonCamera extends Component {
  private _camera: PerspectiveCamera;
  private _controller: BasicCharacterController;

  private _currentPosition = new THREE.Vector3();
  private _currentLookat = new THREE.Vector3();

  constructor(camera: PerspectiveCamera, controller: BasicCharacterController) {
    super();
    this._camera = camera;
    this._controller = controller;
  }

  public InitComponent(): void {
    const threejs = this.FindEntity(THREEJS)?.GetComponent(
      THREEJS_CONTROLLER
    ) as ThreeJSController;
    this._camera = threejs.GetCamera();
  }

  public Update(time: number): void {
    const idealOffset = this._calculateIdealOffset();
    const idealLookat = this._calculateIdealLookat();

    // const t = 0.05;
    // const t = 4.0 * timeElapsed;
    const t = 1.0 - Math.pow(0.01, time);

    this._currentPosition.lerp(idealOffset, t);
    this._currentLookat.lerp(idealLookat, t);

    this._camera?.position.copy(this._currentPosition);
    this._camera?.lookAt(this._currentLookat);
  }

  private _calculateIdealOffset() {
    const idealOffset = new THREE.Vector3(0, 100, 100);
    idealOffset.applyQuaternion(
      new Quaternion(
        this._controller.GetQuaternion()?.x,
        this._controller.GetQuaternion()?.y,
        this._controller.GetQuaternion()?.z,
        this._controller.GetQuaternion()?.w
      )
    );
    idealOffset.add(
      new Vector3(
        this._controller.GetPosition()?.x,
        this._controller.GetPosition()?.y,
        this._controller.GetPosition()?.z
      )
    );

    return idealOffset;
  }

  private _calculateIdealLookat() {
    const idealLookat = new THREE.Vector3(0, 50, 250);
    idealLookat.applyQuaternion(
      new Quaternion(
        this._controller.GetQuaternion()?.x,
        this._controller.GetQuaternion()?.y,
        this._controller.GetQuaternion()?.z,
        this._controller.GetQuaternion()?.w
      )
    );
    idealLookat.add(
      new Vector3(
        this._controller.GetPosition()?.x,
        this._controller.GetPosition()?.y,
        this._controller.GetPosition()?.z
      )
    );
    return idealLookat;
  }
}
