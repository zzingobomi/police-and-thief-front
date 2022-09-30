import { Engine, EngineMode } from "@trixt0r/ecs";
import { GltfRenderer } from "./Components/GltfRenderer";
import { ThreeComponent } from "./Components/ThreeComponent";
import { Transform } from "./Components/Transform";
import { MyEntity } from "./Entities/my-entity";
import { MovementSystem } from "./System/movement";
import { RenderSystem } from "./System/RenderSystem";
import { ThreeSystem } from "./System/ThreeSystem";

export class ThreeEngine extends Engine {
  constructor(container: HTMLDivElement) {
    super();
    this.init(container);
  }

  private init(container: HTMLDivElement) {
    const threeEntity = new MyEntity();
    threeEntity.components.add(new ThreeComponent(container));
    this.entities.add(threeEntity);

    const entity = new MyEntity();
    entity.components.add(new Transform());
    entity.components.add(new GltfRenderer("./glb/box_man.glb"));
    this.entities.add(entity);

    this.systems.add(new ThreeSystem());
    this.systems.add(new MovementSystem());
    this.systems.add(new RenderSystem());

    requestAnimationFrame(this.render.bind(this));
  }

  render(delta: number) {
    this.run(delta);

    requestAnimationFrame(this.render.bind(this));
  }
}
