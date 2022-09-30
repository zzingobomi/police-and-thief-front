import { Aspect, System, Engine } from "@trixt0r/ecs";
import { GltfRenderer } from "../Components/GltfRenderer";
import { ThreeComponent } from "../Components/ThreeComponent";

export class RenderSystem extends System {
  private aspect: Aspect;
  private threeComponent: ThreeComponent;

  constructor() {
    super();
  }

  onAddedToEngine(engine: Engine): void {
    // TODO: ThreeComponent 를 좀 쉽게 얻어올 수 없을까..
    this.aspect = Aspect.for(engine).all(GltfRenderer);
    this.threeComponent = Aspect.for(engine)
      .one(ThreeComponent)
      .entities[0].components.get(ThreeComponent);
    const entities = this.aspect.entities;
    entities.forEach((entity) => {
      const renderer = entity.components.get(GltfRenderer);
      this.threeComponent.scene.add(renderer.model);
    });
  }

  async process() {}
}
