import { GltfRenderer } from "./EngineSystem/Components/GltfRenderer";
import { MeshRenderer } from "./EngineSystem/Components/MeshRenderer";
import { Rigidbody } from "./EngineSystem/Components/Rigidbody";
import { Transform } from "./EngineSystem/Components/Transform";
import { GameObjectManager } from "./EngineSystem/GameObjectManager";
import { RenderingManager } from "./GraphicsSystem/RenderingManager";
import { InputManager } from "./InputSystem/InputManager";
import { PhysicsManager } from "./PhysicsSystem/PhysicsManager";
import { ManagerStore } from "./Utils/ManagerStore";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { SphereCollider } from "./EngineSystem/Components/SphereCollider";
import { MeshCollider } from "./EngineSystem/Components/MeshCollider";
import { AssetManager } from "./AssetSystem/AssetManager";
import { SignalType } from "./Enums/SignalType";
import { Object3D } from "three";
import { GameObject } from "./EngineSystem/GameObject";
import { GLTF } from "three-stdlib";
import { BODY_TYPES } from "cannon-es";

export class GameMain {
  private previousTime = 0;
  private managerStore = new ManagerStore();

  constructor() {
    this.init();
  }

  private init() {
    PubSub.subscribe(SignalType.ASSETS_LOADED, this.start.bind(this));

    this.managerStore.AddManager(new RenderingManager());
    this.managerStore.AddManager(new AssetManager());
    this.managerStore.AddManager(new PhysicsManager());
    this.managerStore.AddManager(new InputManager());
    this.managerStore.AddManager(new GameObjectManager());
  }

  private start() {
    this.initGameObject();

    // test code
    // const world =
    //   ManagerStore.GetManager(GameObjectManager).CreateGameObject("world");
    // world.AddComponent(new MeshRenderer(AssetManager.Find("floor")));
    // world.AddComponent(new MeshCollider(AssetManager.Find("floor")));
    // world.AddComponent(new Rigidbody(0));

    // const worldTransform = world.GetComponent(Transform);
    // if (worldTransform) worldTransform.SetRotation(-Math.PI * 0.5, 0, 0);

    // const shpere =
    //   ManagerStore.GetManager(GameObjectManager).CreateGameObject("shpere");
    // shpere.AddComponent(new MeshRenderer(AssetManager.Find("shpere")));
    // shpere.AddComponent(new SphereCollider());
    // shpere.AddComponent(new Rigidbody(1, BODY_TYPES.DYNAMIC));

    // const shpereTransform = shpere.GetComponent(Transform);
    // if (shpereTransform) shpereTransform.SetPosition(0, 10, 0);

    this.managerStore.Start();
    requestAnimationFrame(this.Render.bind(this));
  }

  private initGameObject() {
    this.createWorldObject();
    //this.createBookObject();
    //this.createManObject();
  }

  private createWorldObject() {
    const glb = AssetManager.Find("world") as GLTF;
    const name = "world";
    const glbGameObject = new GameObject(name);
    const glbTransform = new Transform();
    glbGameObject.AddComponent(glbTransform);
    glbGameObject.add(glb.scene);
    ManagerStore.GetManager(GameObjectManager).AddGameObject(glbGameObject);
    GameObjectManager.gameObjectMap.set(name, glbGameObject);
    ManagerStore.GetManager(RenderingManager).scene.add(glbGameObject);
  }

  private createBookObject() {
    const glb = AssetManager.Find("book") as GLTF;
    const name = "book";
    const glbGameObject = new GameObject(name);
    const glbTransform = new Transform();
    glbGameObject.AddComponent(glbTransform);
    glb.scene.getWorldPosition(glbTransform.Position);
    glb.scene.getWorldQuaternion(glbTransform.Quaternion);
    glb.scene.getWorldScale(glbTransform.Scale);
    glbGameObject.add(glb.scene);
    ManagerStore.GetManager(GameObjectManager).AddGameObject(glbGameObject);
    GameObjectManager.gameObjectMap.set(name, glbGameObject);
    glb.scene.traverse((child) => {
      if (child instanceof THREE.Group || child instanceof THREE.Mesh) {
        //const childName = `${child.name}_${this.generateGameObjectName()}`;
        const childName = `${child.name}`;
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
        ManagerStore.GetManager(GameObjectManager).AddGameObject(childObject);
        GameObjectManager.gameObjectMap.set(name, childObject);
      }
    });

    ManagerStore.GetManager(RenderingManager).scene.add(glbGameObject);
  }

  private createManObject() {
    const glb = AssetManager.Find("man") as GLTF;
    const name = "man";
    const glbGameObject = new GameObject(name);
    const glbTransform = new Transform();
    glbGameObject.AddComponent(glbTransform);
    glb.scene.getWorldPosition(glbTransform.Position);
    glb.scene.getWorldQuaternion(glbTransform.Quaternion);
    glb.scene.getWorldScale(glbTransform.Scale);
    glbGameObject.AddComponent(new SphereCollider());
    glbGameObject.AddComponent(new Rigidbody(1, BODY_TYPES.DYNAMIC));
    glbGameObject.add(glb.scene);
    ManagerStore.GetManager(GameObjectManager).AddGameObject(glbGameObject);
    GameObjectManager.gameObjectMap.set(name, glbGameObject);
    ManagerStore.GetManager(RenderingManager).scene.add(glbGameObject);
  }

  public Render(time: number) {
    time *= 0.001; // second unit

    const deltaTime = time - this.previousTime;
    this.managerStore.Update(deltaTime);
    this.previousTime = time;

    requestAnimationFrame(this.Render.bind(this));
  }

  public Dispose() {
    this.managerStore.Dispose();
  }

  public GetRenderingManager() {
    return ManagerStore.GetManager(RenderingManager);
  }
}
