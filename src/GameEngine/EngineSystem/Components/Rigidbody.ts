import { Component } from "../Component";
import { Types } from "@enable3d/ammo-physics";
import * as CANNON from "cannon-es";
import { ManagerStore } from "../../Utils/ManagerStore";
import { PhysicsManager } from "../../PhysicsSystem/PhysicsManager";
import { Collider } from "./Collider";
import { MeshCollider } from "./MeshCollider";
import { SphereCollider } from "./SphereCollider";

export class Rigidbody extends Component {
  private mass: number;

  constructor(mass: number) {
    super();
    this.mass = mass;
  }

  // TODO: 어떻게 collider 로 spherecollider 를 얻을수 있지..
  // meshcollider 는 왜 안되지..
  // mesh->cannon 안되나?

  Start() {
    const body = new CANNON.Body({
      mass: this.mass,
      shape: this.GetComponent(SphereCollider).shape,
      position: new CANNON.Vec3(
        this.gameObject.position.x,
        this.gameObject.position.y,
        this.gameObject.position.z
      ),
    });

    ManagerStore.GetManager(PhysicsManager).world.addBody(body);
  }
}
