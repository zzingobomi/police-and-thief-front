import { StateType } from "../../enums/StateType";
import { Character } from "../Character";
import { CharacterStateBase } from "./CharacterStateBase";

export class JumpIdle extends CharacterStateBase {
  constructor(character: Character) {
    super(character, StateType.JumpIdle);

    this.playAnimation("jump_idle", 0.1);
  }

  public update(timeStep: number): void {
    super.update(timeStep);
  }
}
