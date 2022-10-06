import { GameMain } from "../GameMain";
import { Manager } from "../Utils/Manager";

export interface IKeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  space: boolean;
  shift: boolean;
  //debug: boolean;
}

export class InputManager extends Manager {
  private keys: IKeyState;

  constructor() {
    super();
  }

  public Start(): void {
    this.keys = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      space: false,
      shift: false,
      //debug: false,
    };

    document.addEventListener("keydown", this.onKeyDownWrapper);
    document.addEventListener("keyup", this.onKeyUpWrapper);
    document.addEventListener("mousedown", this.onMouseDownWrapper);
    document.addEventListener("mousemove", this.onMouseMoveWrapper);
  }

  public Update(delta: number): void {}

  public Dispose(): void {
    document.removeEventListener("keydown", this.onKeyDownWrapper);
    document.removeEventListener("keyup", this.onKeyUpWrapper);
    document.removeEventListener("mousedown", this.onMouseDownWrapper);
    document.removeEventListener("mousemove", this.onMouseMoveWrapper);
  }

  private onMouseDown(event: MouseEvent) {
    //this.gameMain.GetRenderingManager().divContainer.requestPointerLock();
    //document.body.requestPointerLock();
    // TODO:
    //document.body.requestFullscreen();
  }

  private onMouseMove(event: MouseEvent) {
    //if (document.pointerLockElement === document.body) {
    //PubSub.publish(SignalType.MOUSE_MOVE, event);
    //}
  }

  private onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case "W":
      case "w":
        this.keys.forward = true;
        break;
      case "A":
      case "a":
        this.keys.left = true;
        break;
      case "S":
      case "s":
        this.keys.backward = true;
        break;
      case "D":
      case "d":
        this.keys.right = true;
        break;
      case " ":
        this.keys.space = true;
        break;
      case "Shift":
        this.keys.shift = true;
        break;
      //case "Z":
      //case "z":
      //  this.keys.debug = !this.keys.debug;
      //  break;
    }
  }

  private onKeyUp(event: KeyboardEvent) {
    switch (event.key) {
      case "W":
      case "w":
        this.keys.forward = false;
        break;
      case "A":
      case "a":
        this.keys.left = false;
        break;
      case "S":
      case "s":
        this.keys.backward = false;
        break;
      case "D":
      case "d":
        this.keys.right = false;
        break;
      case " ":
        this.keys.space = false;
        break;
      case "Shift":
        this.keys.shift = false;
        break;
    }
  }

  ///
  /// addEventListener Wrapper
  ///
  onKeyDownWrapper = (event: KeyboardEvent) => {
    this.onKeyDown(event);
  };

  onKeyUpWrapper = (event: KeyboardEvent) => {
    this.onKeyUp(event);
  };

  onMouseDownWrapper = (event: MouseEvent) => {
    this.onMouseDown(event);
  };

  onMouseMoveWrapper = (event: MouseEvent) => {
    this.onMouseMove(event);
  };
}
