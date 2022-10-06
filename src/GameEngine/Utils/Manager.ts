import { GameMain } from "../GameMain";

export abstract class Manager {
  //protected gameMain: GameMain;

  // constructor(gameMain: GameMain) {
  //   this.gameMain = gameMain;
  // }

  abstract Start(): void;
  abstract Update(delta: number): void;
  abstract Dispose(): void;
}
