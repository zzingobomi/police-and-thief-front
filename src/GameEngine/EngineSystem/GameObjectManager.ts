import { RenderingManager } from "../GraphicsSystem/RenderingManager";
import { Manager } from "../Utils/Manager";
import { ManagerStore } from "../Utils/ManagerStore";
import { Transform } from "./Components/Transform";
import { GameObject } from "./GameObject";
import * as THREE from "three";
import { GLTF } from "three-stdlib";
import { Rigidbody } from "./Components/Rigidbody";
import { MeshCollider } from "./Components/MeshCollider";

export class GameObjectManager extends Manager {
  private gameObjects: GameObject[] = [];
  static gameObjectMap: Map<string, GameObject> = new Map();
  private gameObjectCount = 0;

  constructor() {
    super();
  }

  public loadGlbGameObject(name: string, glb: GLTF) {
    console.log(glb.scene);
    const glbGameObject = new GameObject(name);
    const glbTransform = new Transform();
    glbGameObject.AddComponent(glbTransform);
    glb.scene.getWorldPosition(glbTransform.Position);
    glb.scene.getWorldQuaternion(glbTransform.Quaternion);
    glb.scene.getWorldScale(glbTransform.Scale);
    glbGameObject.add(glb.scene);
    this.gameObjects.push(glbGameObject);
    GameObjectManager.gameObjectMap.set(name, glbGameObject);
    glb.scene.traverse((child) => {
      if (child instanceof THREE.Group || child instanceof THREE.Mesh) {
        const childName = `${child.name}_${this.generateGameObjectName()}`;
        const childObject = new GameObject(childName);
        const childTransform = new Transform();
        childObject.AddComponent(childTransform);
        child.getWorldPosition(childTransform.Position);
        child.getWorldQuaternion(childTransform.Quaternion);
        child.getWorldScale(childTransform.Scale);
        if (child instanceof THREE.Mesh) {
          childObject.AddComponent(new MeshCollider(child));
          childObject.AddComponent(new Rigidbody(0));
        }
        this.gameObjects.push(childObject);
        GameObjectManager.gameObjectMap.set(name, childObject);
      }
    });

    ManagerStore.GetManager(RenderingManager).scene.add(glbGameObject);
    return glbGameObject;
  }

  public CreateGameObject(name?: string, tag?: string) {
    if (!name) name = this.generateGameObjectName();
    const gameObject = new GameObject(name, tag);
    gameObject.AddComponent(new Transform());
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

  private generateGameObjectName() {
    return `GameObject_` + this.gameObjectCount++;
  }

  static Find(name: string) {
    return this.gameObjectMap.get(name);
  }
}
