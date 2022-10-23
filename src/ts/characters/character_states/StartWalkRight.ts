import { StateType } from "../../enums/StateType";
import { Character } from "../Character";
import { StartWalkBase } from "./StartWalkBase";

export class StartWalkRight extends StartWalkBase {
  constructor(character: Character) {
    super(character, StateType.StartWalkRight);
    this.animationLength = character.setAnimation("start_right", 0.1);
  }
}
