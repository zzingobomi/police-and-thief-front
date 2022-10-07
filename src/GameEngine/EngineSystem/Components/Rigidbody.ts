import { Component } from "../Component";
import * as CANNON from "cannon-es";
import { ManagerStore } from "../../Utils/ManagerStore";
import { PhysicsManager } from "../../PhysicsSystem/PhysicsManager";
import { Collider } from "./Collider";
import CannonUtils from "../../Utils/CannonUtils";
import { Transform } from "./Transform";

export class Rigidbody extends Component {
  private mass: number;
  private body: CANNON.Body;

  constructor(mass: number) {
    super();
    this.mass = mass;
  }

  public Start() {
    const collider = this.GetComponent(Collider);
    if (collider) {
      this.body = new CANNON.Body({
        mass: this.mass,
        shape: collider.shape,
        position: CannonUtils.Three2Cannon()
          .vector3(this.gameObject.position)
          .vadd(collider.Center),
        quaternion: CannonUtils.Three2Cannon().quaternion(
          this.gameObject.quaternion
        ),
      });

      ManagerStore.GetManager(PhysicsManager).world.addBody(this.body);
    }
  }

  public Update() {
    const transform = this.GetComponent(Transform);
    if (transform) {
      transform.Position = CannonUtils.Cannon2Three().vector3(
        this.body.position
      );
      transform.Quaternion = CannonUtils.Cannon2Three().quaternion(
        this.body.quaternion
      );
    }
  }
}
