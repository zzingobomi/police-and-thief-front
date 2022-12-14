import { Component } from "../Component";
import * as CANNON from "cannon-es";
import { ManagerStore } from "../../Utils/ManagerStore";
import { PhysicsManager } from "../../PhysicsSystem/PhysicsManager";
import { Collider } from "./Collider/Collider";
import CannonUtils from "../../Utils/CannonUtils";
import { Transform } from "./Transform";
import { BodyType, BODY_TYPES } from "cannon-es";

export class Rigidbody extends Component {
  private mass: number;
  private type: BodyType;
  private body: CANNON.Body;

  constructor(mass: number, type: BodyType = BODY_TYPES.STATIC) {
    super();
    this.mass = mass;
    this.type = type;
  }

  public Start() {
    const collider = this.GetComponent(Collider);
    if (collider) {
      this.body = new CANNON.Body({
        mass: this.mass,
        type: this.type,
        shape: collider.shape,
        position: CannonUtils.cannonVector(this.gameObject.position)
        .vadd(collider.center),
        quaternion: CannonUtils.cannonQuat(this.gameObject.quaternion),
      });
      this.body.addEventListener("collide", this.onCollide);

      ManagerStore.GetManager(PhysicsManager).world.addBody(this.body);
    }
  }

  public Update() {
    //if (this.mass > 0) {
    //  console.log(this.body.velocity);
    //}
    const transform = this.GetComponent(Transform);
    if (transform) {
      transform.Position = CannonUtils.threeVector(this.body.position);
      transform.Quaternion = CannonUtils.threeQuat(this.body.quaternion);
    }
  }

  private onCollide() {
    console.log("onCollide");
  }
}
