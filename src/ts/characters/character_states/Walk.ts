import { Character } from "../Character";
import { CharacterStateBase } from "./CharacterStateBase";
import { Idle } from "./Idle";

export class Walk extends CharacterStateBase {
  constructor(character: Character) {
    super(character);

    this.playAnimation("run", 0.1);
  }

  public update(delta: number): void {
    super.update(delta);
  }

  public onInputChange(): void {
    super.onInputChange();

    if (this.noDirection()) {
      if (this.character.velocity.length() > 1) {
        //this.character.setState(new EndWalk(this.character));
      } else {
        this.character.setState(new Idle(this.character));
      }
    }
  }
}
