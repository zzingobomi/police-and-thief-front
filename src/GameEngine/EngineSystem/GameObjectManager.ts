import { RenderingManager } from "../GraphicsSystem/RenderingManager";
import { Manager } from "../Utils/Manager";
import { ManagerStore } from "../Utils/ManagerStore";
import { Transform } from "./Components/Transform";
import { GameObject } from "./GameObject";

export class GameObjectManager extends Manager {
  private gameObjects: GameObject[] = [];
  static gameObjectMap: Map<string, GameObject> = new Map();
  private gameObjectCount = 0;

  constructor() {
    super();
  }

  public CreateGameObject(name?: string, tag?: string) {
    if (!name) name = this.generateGameObjectName();
    const gameObject = new GameObject(name, tag);
    gameObject.AddComponent(new Transform());
    this.gameObjects.push(gameObject);
    GameObjectManager.gameObjectMap.set(name, gameObject);
    // TODO: 여기가 문제가 될거 같은데....
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

  private generateGameObjectName() {
    return `GameObject_` + this.gameObjectCount++;
  }

  static Find(name: string) {
    return this.gameObjectMap.get(name);
  }
}
