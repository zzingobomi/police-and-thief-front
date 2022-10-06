import { Component } from "../Component";
import { Types } from "@enable3d/ammo-physics";
import * as CANNON from "cannon-es";
import { ManagerStore } from "../../Utils/ManagerStore";
import { PhysicsManager } from "../../PhysicsSystem/PhysicsManager";

export interface RigidbodyConfig {
  mass?: number;
  position?: CANNON.Vec3;
  shape?: CANNON.Shape;
  material?: CANNON.Material;
}

export class Rigidbody extends Component {
  private config: RigidbodyConfig;

  constructor(config?: RigidbodyConfig) {
    super();
    if (config) this.config = config;
  }

  Start() {
    const body = new CANNON.Body(this.config);
    ManagerStore.GetManager(PhysicsManager).world.addBody(body);
  }
}
