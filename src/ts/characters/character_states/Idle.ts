import { Character } from "../Character";
import { CharacterStateBase } from "./CharacterStateBase";
import { Walk } from "./Walk";

export class Idle extends CharacterStateBase {
  constructor(character: Character) {
    super(character);

    this.playAnimation("idle", 0.1);
  }

  public update(delta: number): void {
    super.update(delta);
  }

  public onInputChange(): void {
    super.onInputChange();

    if (this.anyDirection()) {
      if (this.character.velocity.length() > 0.5) {
        this.character.setState(new Walk(this.character));
      }
    }
  }
}
