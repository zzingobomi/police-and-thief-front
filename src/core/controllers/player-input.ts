import { Component } from "../component";
import PubSub from "pubsub-js";
import { SignalType } from "../signal-type";

export interface IKeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  space: boolean;
  shift: boolean;
  punch: boolean;
  dance: boolean;
}

export class BasicCharacterControllerInput extends Component {
  private _keys: IKeyState;

  constructor() {
    super();
    this._keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      space: false,
      shift: false,
      punch: false,
      dance: false,
    };
  }

  public InitComponent(): void {
    document.addEventListener("keydown", this.onKeyDownWrapper);
    document.addEventListener("keyup", this.onKeyUpWrapper);
    document.addEventListener("mousedown", this.onMouseDownWrapper);
    document.addEventListener("mousemove", this.onMouseMoveWrapper);
  }

  public Dispose(): void {
    if (document.pointerLockElement === document.body) {
      document.exitPointerLock();
    }
    document.removeEventListener("keydown", this.onKeyDownWrapper);
    document.removeEventListener("keyup", this.onKeyUpWrapper);
    document.removeEventListener("mousedown", this.onMouseDownWrapper);
    document.removeEventListener("mousemove", this.onMouseMoveWrapper);
  }

  get Keys() {
    return this._keys;
  }

  private _onMouseDown(event: MouseEvent) {
    document.body.requestPointerLock();
    // TODO:
    //document.body.requestFullscreen();
  }

  private _onMouseMove(event: MouseEvent) {
    if (document.pointerLockElement === document.body) {
      PubSub.publish(SignalType.MOUSE_MOVE, event);
    }
  }

  private _onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "W":
      case "w":
        this._keys.forward = true;
        break;
      case "A":
      case "a":
        this._keys.left = true;
        break;
      case "S":
      case "s":
        this._keys.backward = true;
        break;
      case "D":
      case "d":
        this._keys.right = true;
        break;
      case " ":
        this._keys.space = true;
        break;
      case "Shift":
        this._keys.shift = true;
        break;
      case "f":
      case "F":
        this._keys.punch = true;
        break;
      case "h":
      case "H":
        this._keys.dance = true;
        break;
    }
  }

  private _onKeyUp(event: KeyboardEvent) {
    switch (event.key) {
      case "W":
      case "w":
        this._keys.forward = false;
        break;
      case "A":
      case "a":
        this._keys.left = false;
        break;
      case "S":
      case "s":
        this._keys.backward = false;
        break;
      case "D":
      case "d":
        this._keys.right = false;
        break;
      case " ":
        this._keys.space = false;
        break;
      case "Shift":
        this._keys.shift = false;
        break;
      case "f":
      case "F":
        this._keys.punch = false;
        break;
      case "h":
      case "H":
        this._keys.dance = false;
        break;
    }
  }

  ///
  /// addEventListener Wrapper
  ///
  onKeyDownWrapper = (event: KeyboardEvent) => {
    this._onKeyDown(event);
  };

  onKeyUpWrapper = (event: KeyboardEvent) => {
    this._onKeyUp(event);
  };

  onMouseDownWrapper = (event: MouseEvent) => {
    this._onMouseDown(event);
  };

  onMouseMoveWrapper = (event: MouseEvent) => {
    this._onMouseMove(event);
  };
}
