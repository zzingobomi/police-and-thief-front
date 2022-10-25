import { StateType } from "../../enums/StateType";
import { Character } from "../Character";
import { CharacterStateBase } from "./CharacterStateBase";

export class DropIdle extends CharacterStateBase {
  constructor(character: Character) {
    super(character, StateType.DropIdle);

    this.playAnimation("drop_idle", 0.1);
  }

  public update(timeStep: number): void {
    super.update(timeStep);
  }

  public onInputChange(): void {
    super.onInputChange();
  }
}
