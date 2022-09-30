import { Aspect, System, Engine } from "@trixt0r/ecs";
import { ThreeComponent } from "../Components/ThreeComponent";

export class ThreeSystem extends System {
  private aspect: Aspect;
  private threeComponent: ThreeComponent;

  constructor() {
    super();
  }

  onAddedToEngine(engine: Engine): void {
    this.aspect = Aspect.for(engine).one(ThreeComponent);
    this.threeComponent =
      this.aspect.entities[0].components.get(ThreeComponent);

    window.onresize = this.resize.bind(this);
    this.resize();
  }

  resize() {
    const width = this.threeComponent.divContainer.clientWidth;
    const height = this.threeComponent.divContainer.clientHeight;

    this.threeComponent.camera.aspect = width / height;
    this.threeComponent.camera.updateProjectionMatrix();

    this.threeComponent.renderer.setSize(width, height);
  }

  process() {
    this.threeComponent.renderer.render(
      this.threeComponent.scene,
      this.threeComponent.camera
    );
  }
}
