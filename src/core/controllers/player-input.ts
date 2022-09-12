import { Component } from "../component";

export interface IKeyState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  space: boolean;
  shift: boolean;
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
    };
  }

  public InitComponent(): void {
    document.addEventListener("keydown", (event) => this._onKeyDown(event));
    document.addEventListener("keyup", (event) => this._onKeyUp(event));
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
      case "space":
        this._keys.space = true;
        break;
      case "shift":
        this._keys.shift = true;
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
      case "space":
        this._keys.space = false;
        break;
      case "shift":
        this._keys.shift = false;
        break;
    }
  }
}
