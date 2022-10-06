import { GameMain } from "../GameMain";
import { RenderingManager } from "../GraphicsSystem/RenderingManager";
import { Manager } from "../Utils/Manager";
import { ManagerStore } from "../Utils/ManagerStore";
import { GameObject } from "./GameObject";

export class GameObjectManager extends Manager {
  private gameObjects: GameObject[] = [];
  static gameObjectMap: Map<string, GameObject> = new Map();

  constructor() {
    super();
  }

  public CreateGameObject(name: string, tag?: string) {
    const gameObject = new GameObject(name, tag);
    this.gameObjects.push(gameObject);
    GameObjectManager.gameObjectMap.set(name, gameObject);
    ManagerStore.GetManager(RenderingManager).scene.add(gameObject);
    return gameObject;
  }

  public Start(): void {
    for (const gameObject of this.gameObjects) {
      gameObject.Start();
    }
  }

  public Update(delta: number): void {
    for (const gameObject of this.gameObjects) {
      gameObject.Update(delta);
    }
  }

  public Dispose(): void {
    for (const gameObject of this.gameObjects) {
      gameObject.Dispose();
    }
  }

  static Find(name: string) {
    return this.gameObjectMap.get(name);
  }
}
