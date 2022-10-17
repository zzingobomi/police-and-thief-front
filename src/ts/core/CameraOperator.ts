import { IInputReceiver } from "../interfaces/IInputReceiver";
import { IUpdatable } from "../interfaces/IUpdatable";
import { KeyBinding } from "./KeyBinding";

export class CameraOperator implements IInputReceiver, IUpdatable {
  public updateOrder = 4;
  public actions: { [action: string]: KeyBinding };

  update(delta: number) {
    throw new Error("Method not implemented.");
  }

  handleKeyboardEvent(event: KeyboardEvent, code: string, pressed: boolean) {
    throw new Error("Method not implemented.");
  }
  handleMouseButton(event: MouseEvent, code: string, pressed: boolean) {
    throw new Error("Method not implemented.");
  }
  handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number) {
    throw new Error("Method not implemented.");
  }
  handleMouseWheel(event: WheelEvent, value: number) {
    throw new Error("Method not implemented.");
  }
  inputReceiverInit() {
    throw new Error("Method not implemented.");
  }
  inputReceiverUpdate(delta: number) {
    throw new Error("Method not implemented.");
  }
}
