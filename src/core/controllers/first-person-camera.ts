import { Component } from "../component";
import PubSub from "pubsub-js";
import { SignalType } from "../signal-type";
import { PerspectiveCamera } from "three";
import { THREEJS, THREEJS_CONTROLLER } from "../constant";
import { ThreeJSController } from "./threejs-controller";

// TODO: examples/fames_fps.html, OctreeHelper
export class FirstPersonCamera extends Component {
  private _camera: PerspectiveCamera | null;

  constructor() {
    super();
    this._camera = null;
  }

  public InitComponent(): void {
    const threejs = this.FindEntity(THREEJS)?.GetComponent(
      THREEJS_CONTROLLER
    ) as ThreeJSController;
    this._camera = threejs.GetCamera();
    PubSub.subscribe(SignalType.MOUSE_MOVE, (msg, event) => {
      this.onMouseMove(event);
    });
  }

  private onMouseMove(event: MouseEvent) {
    if (!this._camera) return;
    this._camera.rotation.y -= event.movementX / 500;
    this._camera.rotation.x -= event.movementY / 500;
  }
}
