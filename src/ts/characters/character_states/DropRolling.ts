import { StateType } from "../../enums/StateType";
import { Character } from "../Character";
import { CharacterStateBase } from "./CharacterStateBase";

export class DropRolling extends CharacterStateBase {
  constructor(character: Character) {
    super(character, StateType.DropRolling);

    this.playAnimation("drop_running_roll", 0.03);
  }

  public update(timeStep: number): void {
    super.update(timeStep);
  }
}
