import { Engine } from "./Core/engine";
import { GltfRenderer } from "./Components/GltfRenderer";
import { ThreeComponent } from "./Components/ThreeComponent";
import { Transform } from "./Components/Transform";
import { GameObject } from "./Entities/GameObject";
import { MovementSystem } from "./System/movement";
import { RenderSystem } from "./System/RenderSystem";
import { ThreeSystem } from "./System/ThreeSystem";
import {
  ENTITY_MY_PLAYER,
  ENTITY_THREE,
  ENTITY_WORLD,
} from "./Constant/EntityName";

export class ThreeEngine extends Engine<GameObject> {
  constructor(container: HTMLDivElement) {
    super();
    this.initWorld(container);
  }

  private initWorld(container: HTMLDivElement) {
    // TODO: 이부분도 Manager 를 통해 factory 패턴을 이용해야 하나?
    const threeEntity = new GameObject(ENTITY_THREE);
    threeEntity.components.add(new ThreeComponent(container));
    this.entities.add(threeEntity);

    const world = new GameObject(ENTITY_WORLD);
    world.components.add(new Transform());
    world.components.add(new GltfRenderer("./glb/book.glb"));
    this.entities.add(world);

    const myPlayer = new GameObject(ENTITY_MY_PLAYER);
    myPlayer.components.add(new Transform());
    myPlayer.components.add(new GltfRenderer("./glb/box_man.glb"));
    this.entities.add(myPlayer);

    this.systems.add(new ThreeSystem());
    this.systems.add(new MovementSystem());
    this.systems.add(new RenderSystem());

    this.init();

    requestAnimationFrame(this.render.bind(this));
  }

  render(delta: number) {
    this.run(delta);

    requestAnimationFrame(this.render.bind(this));
  }

  public GetScene() {
    return GameObject.Find(ENTITY_THREE)?.components.get(ThreeComponent).scene;
  }
}
