import { StateType } from "../../enums/StateType";
import { Character } from "../Character";
import { CharacterStateBase } from "./CharacterStateBase";

export class DropRunning extends CharacterStateBase {
  constructor(character: Character) {
    super(character, StateType.DropRunning);

    this.playAnimation("drop_running", 0.1);
  }

  public update(timeStep: number): void {
    super.update(timeStep);
  }

  public onInputChange(): void {
    super.onInputChange();
  }
}
