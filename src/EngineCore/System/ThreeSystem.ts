import { Aspect } from "../Core/aspect";
import { System } from "../Core/system";
import { Engine } from "../Core/engine";
import { ThreeComponent } from "../Components/ThreeComponent";
import { GameObject } from "../Entities/GameObject";
import { ENTITY_THREE } from "../Constant/EntityName";

export class ThreeSystem extends System {
  private threeComponent: ThreeComponent;

  constructor() {
    super();
  }

  init() {
    this.threeComponent = GameObject.Find(ENTITY_THREE)?.components.get(
      ThreeComponent
    ) as ThreeComponent;

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
