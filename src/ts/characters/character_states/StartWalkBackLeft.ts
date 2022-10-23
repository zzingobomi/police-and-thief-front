import { StateType } from "../../enums/StateType";
import { Character } from "../Character";
import { StartWalkBase } from "./StartWalkBase";

export class StartWalkBackLeft extends StartWalkBase {
  constructor(character: Character) {
    super(character, StateType.StartWalkBackLeft);
    this.animationLength = character.setAnimation("start_back_left", 0.1);
  }
}
