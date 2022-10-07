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

export class GameMain {
  private previousTime = 0;
  private managerStore = new ManagerStore();

  constructor() {
    this.init();
  }

  private init() {
    this.managerStore.AddManager(new RenderingManager());
    this.managerStore.AddManager(new PhysicsManager());
    this.managerStore.AddManager(new InputManager());
    this.managerStore.AddManager(new GameObjectManager());

    // test code
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({
        color: "#777777",
        metalness: 0.3,
        roughness: 0.4,
      })
    );
    floor.receiveShadow = true;

    const world =
      ManagerStore.GetManager(GameObjectManager).CreateGameObject("world");
    world.AddComponent(new Transform());
    world.AddComponent(new MeshRenderer(floor));
    world.AddComponent(new MeshCollider(floor));
    world.AddComponent(new Rigidbody(0));

    const worldTransform = world.GetComponent(Transform);
    if (worldTransform) worldTransform.SetRotation(-Math.PI * 0.5, 0, 0);

    const myPlayer =
      ManagerStore.GetManager(GameObjectManager).CreateGameObject("myPlayer");
    myPlayer.AddComponent(new Transform());
    const player = new THREE.Mesh(
      new THREE.SphereGeometry(1),
      new THREE.MeshStandardMaterial({
        color: "#777777",
      })
    );
    myPlayer.AddComponent(new MeshRenderer(player));
    myPlayer.AddComponent(new SphereCollider());
    myPlayer.AddComponent(new Rigidbody(1));

    const myPlayerTransform = myPlayer.GetComponent(Transform);
    if (myPlayerTransform) myPlayerTransform.SetPosition(0, 10, 0);

    // temp
    // const world =
    //   ManagerStore.GetManager(GameObjectManager).CreateGameObject("world");
    // world.AddComponent(new Transform());
    // world.AddComponent(new GltfRenderer("./glb/book.glb"));
    // world.AddComponent(
    //   new Rigidbody({
    //     shape: "concave",
    //     mass: 0,
    //     collisionFlags: 1,
    //     autoCenter: false,
    //   })
    // );

    // const myPlayer =
    //   ManagerStore.GetManager(GameObjectManager).CreateGameObject("myPlayer");
    // myPlayer.AddComponent(new Transform());
    // myPlayer.AddComponent(new GltfRenderer("./glb/box_man.glb"));
    // myPlayer.AddComponent(
    //   new Rigidbody({
    //     // shape: new CANNON.Box(),
    //     // radius: 0.25,
    //     // width: 0.5,
    //     // offset: { y: -0.25 },
    //   })
    // );
    // myPlayer.GetComponent(Transform).SetPosition(-1, 0, 0);

    //console.log(this.renderingManager.scene);

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
