import { StateType } from "../../enums/StateType";
import { Character } from "../Character";
import { CharacterStateBase } from "./CharacterStateBase";

export class JumpRunning extends CharacterStateBase {
  constructor(character: Character) {
    super(character, StateType.JumpRunning);

    this.playAnimation("jump_running", 0.03);
  }

  public update(timeStep: number): void {
    super.update(timeStep);
  }
}
