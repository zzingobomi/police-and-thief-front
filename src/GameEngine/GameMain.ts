import { GltfRenderer } from "./EngineSystem/Components/GltfRenderer";
import { Transform } from "./EngineSystem/Components/Transform";
import { GameObjectManager } from "./EngineSystem/GameObjectManager";
import { RenderingManager } from "./GraphicsSystem/RenderingManager";
import { InputManager } from "./InputSystem/InputManager";

export class GameMain {
  private previousTime = 0;
  private renderingManager: RenderingManager;
  private inputManager: InputManager;
  private gameObjectManager: GameObjectManager;

  constructor() {
    this.init();
  }

  private init() {
    this.renderingManager = new RenderingManager(this);
    this.inputManager = new InputManager(this);
    this.gameObjectManager = new GameObjectManager(this);

    // temp
    const world = this.gameObjectManager.CreateGameObject("world");
    world.AddComponent(new Transform());
    world.AddComponent(new GltfRenderer("./glb/book.glb"));

    const myPlayer = this.gameObjectManager.CreateGameObject("myPlayer");
    myPlayer.AddComponent(new Transform());
    myPlayer.AddComponent(new GltfRenderer("./glb/box_man.glb"));
    (myPlayer.GetComponent(Transform) as Transform).SetPosition(1, 0, 0);

    //console.log(this.renderingManager.scene);

    this.gameObjectManager.Start();
    requestAnimationFrame(this.Render.bind(this));
  }

  public Render(time: number) {
    time *= 0.001; // second unit

    const deltaTime = time - this.previousTime;
    this.renderingManager.Render(deltaTime);
    this.gameObjectManager.Update(deltaTime);
    this.previousTime = time;

    requestAnimationFrame(this.Render.bind(this));
  }

  public Dispose() {
    this.gameObjectManager.Dispose();
    this.renderingManager.Dispose();
  }

  public GetRenderingManager() {
    return this.renderingManager;
  }
  public GetInputManager() {
    return this.inputManager;
  }
  public GetGameObjectManager() {
    return this.gameObjectManager;
  }
}
