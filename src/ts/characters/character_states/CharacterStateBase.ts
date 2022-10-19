import * as Utils from "../../utils/FunctionLibrary";
import { Character } from "../Character";
import { ICharacterState } from "../../interfaces/ICharacterState";
import { StartWalkBackLeft } from "./StartWalkBackLeft";

export abstract class CharacterStateBase implements ICharacterState {
  public character: Character;
  public timer: number;
  public animationLength: any;

  constructor(character: Character) {
    this.character = character;
  }

  public update(delta: number): void {
    this.timer += delta;
  }

  public onInputChange(): void {}

  protected playAnimation(animName: string, fadeIn: number): void {
    this.animationLength = this.character.setAnimation(animName, fadeIn);
  }

  public animationEnded(delta: number) {
    if (this.character.mixer !== undefined) {
      if (this.animationLength === undefined) {
        console.error(
          this.constructor.name +
            "Error: Set this.animationLength in state constructor!"
        );
        return false;
      } else {
        return this.timer > this.animationLength - delta;
      }
    } else {
      return true;
    }
  }

  public noDirection(): boolean {
    return (
      !this.character.actions.up.isPressed &&
      !this.character.actions.down.isPressed &&
      !this.character.actions.left.isPressed &&
      !this.character.actions.right.isPressed
    );
  }

  public anyDirection(): boolean {
    return (
      this.character.actions.up.isPressed ||
      this.character.actions.down.isPressed ||
      this.character.actions.left.isPressed ||
      this.character.actions.right.isPressed
    );
  }

  public setAppropriateStartWalkState() {
    const range = Math.PI;
    const angle = Utils.getSignedAngleBetweenVectors(
      this.character.orientation,
      this.character.getCameraRelativeMovementVector()
    );

    // TODO: cannot access before initionlize..

    if (angle > range * 0.8) {
      this.character.setState(new StartWalkBackLeft(this.character));
    }
  }
}
