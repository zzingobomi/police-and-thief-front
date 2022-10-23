import { StateType } from "../../enums/StateType";
import { Character } from "../Character";
import { StartWalkBase } from "./StartWalkBase";

export class StartWalkLeft extends StartWalkBase {
  constructor(character: Character) {
    super(character, StateType.StartWalkLeft);
    this.animationLength = character.setAnimation("start_left", 0.1);
  }
}
