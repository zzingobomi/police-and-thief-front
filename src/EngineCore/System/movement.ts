import { AbstractEntitySystem } from "../Core/system";
import { Transform } from "../Components/Transform";
import { MyEntity } from "../Entities/my-entity";

export class MovementSystem extends AbstractEntitySystem<MyEntity> {
  constructor(priority = 0) {
    super(priority, [Transform]);
  }

  processEntity(entity: MyEntity) {
    const transform = entity.components.get(Transform);
    //console.log(transform);
  }
}
