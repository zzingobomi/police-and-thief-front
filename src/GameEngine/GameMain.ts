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
    // TODO: Unity를 보고 이 구조를 어떻게 해야 좋을지 생각해보자..
    // (AssetManager.Find("book") as THREE.Group).traverse(
    //   (child: Object3D<THREE.Event>) => {
    //     if (child instanceof THREE.Mesh) {
    //       console.log(child);
    //     }
    //   }
    // );

    // const world =
    //   ManagerStore.GetManager(GameObjectManager).CreateGameObject("world");
    // world.traverse((child: Object3D<THREE.Event>) => {
    //   if (child instanceof THREE.Mesh) {
    //     console.log(child);
    //   }
    // });

    //world.AddComponent(new MeshRenderer(AssetManager.Find("book")));
    // 1. 하니의 메시로 합친다.. 이건 옵션으로 줘야할거 같고..
    // 2. 쭉 돌면서 mesh라면 gameObject 를 생성한다.
    // 3. glb 를 하나씩만 받아오도록..? 아냐... three 자체가 하이어라키 구조인데..
    //world.AddComponent(new MeshCollider(AssetManager.Find("book")));
    //world.AddComponent(new Rigidbody(0));

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
    // shpere.AddComponent(new Rigidbody(1));

    // const shpereTransform = shpere.GetComponent(Transform);
    // if (shpereTransform) shpereTransform.SetPosition(0, 10, 0);

    this.managerStore.Start();
    requestAnimationFrame(this.Render.bind(this));
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
