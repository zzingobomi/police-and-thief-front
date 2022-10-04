import { Aspect } from "../Core/aspect";
import { System } from "../Core/system";
import { Engine } from "../Core/engine";
import { GltfRenderer } from "../Components/GltfRenderer";
import { ThreeComponent } from "../Components/ThreeComponent";
import { GameObject } from "../Entities/GameObject";
import { ENTITY_THREE } from "../Constant/EntityName";

export class RenderSystem extends System {
  private aspect: Aspect;
  private threeComponent: ThreeComponent;

  constructor() {
    super();
  }

  onAddedToEngine(engine: Engine): void {
    this.aspect = Aspect.for(engine).all(GltfRenderer);
  }

  init() {
    this.threeComponent = GameObject.Find(ENTITY_THREE)?.components.get(
      ThreeComponent
    ) as ThreeComponent;
    const entities = this.aspect.entities;
    entities.forEach((entity) => {
      const renderer = entity.components.get(GltfRenderer);
      this.threeComponent.scene.add(renderer.model);
    });
  }

  process() {}
}
