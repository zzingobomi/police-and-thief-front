import { Character } from "../Character";
import { CharacterStateBase } from "./CharacterStateBase";
import { Idle } from "./Idle";
import { Walk } from "./Walk";

export class StartWalkBase extends CharacterStateBase {
  constructor(character: Character) {
    super(character);

    this.character.rotationSimulator.mass = 20;
    this.character.rotationSimulator.damping = 0.7;

    this.character.setArcadeVelocityTarget(0.8);
  }

  public update(delta: number) {
    super.update(delta);

    if (this.animationEnded(delta)) {
      this.character.setState(new Walk(this.character));
    }
  }

  public onInputChange() {
    super.onInputChange();

    if (this.noDirection()) {
      this.character.setState(new Idle(this.character));
    }
  }
}
