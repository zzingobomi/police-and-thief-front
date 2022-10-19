import { Character } from "../Character";
import { StartWalkBase } from "./StartWalkBase";

export class StartWalkBackLeft extends StartWalkBase {
  constructor(character: Character) {
    super(character);
    this.animationLength = character.setAnimation("start_back_left", 0.1);
  }
}
