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
    const world =
      ManagerStore.GetManager(GameObjectManager).CreateGameObject("world");
    world.AddComponent(new Transform());
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(10, 10),
      new THREE.MeshStandardMaterial({
        color: "#777777",
        metalness: 0.3,
        roughness: 0.4,
      })
    );
    floor.receiveShadow = true;
    floor.rotation.x = -Math.PI * 0.5;
    world.AddComponent(new MeshRenderer(floor));
    world.AddComponent(
      new Rigidbody({
        shape: new CANNON.Plane(),
        mass: 0,
      })
    );

    const myPlayer =
      ManagerStore.GetManager(GameObjectManager).CreateGameObject("myPlayer");
    myPlayer.AddComponent(new Transform());
    myPlayer.AddComponent(new GltfRenderer("./glb/box_man.glb"));
    myPlayer.AddComponent(
      new Rigidbody({
        // shape: new CANNON.Box(),
        // radius: 0.25,
        // width: 0.5,
        // offset: { y: -0.25 },
      })
    );
    myPlayer.GetComponent(Transform).SetPosition(-1, 0, 0);

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
