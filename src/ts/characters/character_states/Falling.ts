import { StateType } from "../../enums/StateType";
import { Character } from "../Character";
import { CharacterStateBase } from "./CharacterStateBase";

export class Falling extends CharacterStateBase {
  constructor(character: Character) {
    super(character, StateType.Falling);

    this.playAnimation("falling", 0.3);
  }

  public update(timeStep: number): void {
    super.update(timeStep);
  }
}
