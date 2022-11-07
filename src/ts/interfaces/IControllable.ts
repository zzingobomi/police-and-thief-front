import { Character } from "../characters/Character";
import { EntityType } from "../enums/EntityType";
import { IInputReceiver } from "./IInputReceiver";

export interface IControllable extends IInputReceiver {
  entityType: EntityType;
  controllingCharacter: Character | null | undefined;

  allowSleep(value: boolean): void;
  onInputChange(): void;
  noDirectionPressed(): boolean;
}
