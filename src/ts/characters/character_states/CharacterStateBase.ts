import { ICharacterState } from "../../interfaces/ICharacterState";
import { Character } from "../Character";

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
}
