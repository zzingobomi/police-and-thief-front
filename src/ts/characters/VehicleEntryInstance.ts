import { Character } from "./Character";

export class VehicleEntryInstance {
  public character: Character;

  constructor(character: Character) {
    this.character = character;
  }

  public update(timeStep: number) {}
}
