import { Character } from "../Character";
import { StartWalkBase } from "./StartWalkBase";

export class StartWalkLeft extends StartWalkBase {
  constructor(character: Character) {
    super(character);
    this.animationLength = character.setAnimation("start_left", 0.1);
  }
}
