import { GameMain } from "../GameMain";
import { GameObject } from "./GameObject";

export class GameObjectManager {
  private gameMain: GameMain;

  private gameObjects: GameObject[] = [];
  static gameObjectMap: Map<string, GameObject> = new Map();

  constructor(gameMain: GameMain) {
    this.gameMain = gameMain;
  }

  public CreateGameObject(name: string, tag?: string) {
    const gameObject = new GameObject(name, tag);
    this.gameObjects.push(gameObject);
    GameObjectManager.gameObjectMap.set(name, gameObject);
    this.gameMain.GetRenderingManager().scene.add(gameObject);
    return gameObject;
  }

  public Start() {
    for (const gameObject of this.gameObjects) {
      gameObject.Start();
    }
  }

  public Update(delta: number) {
    for (const gameObject of this.gameObjects) {
      gameObject.Update(delta);
    }
  }

  public Dispose() {
    for (const gameObject of this.gameObjects) {
      gameObject.Dispose();
    }
  }

  static Find(name: string) {
    return this.gameObjectMap.get(name);
  }
}
