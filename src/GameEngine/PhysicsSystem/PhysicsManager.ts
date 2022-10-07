import { Manager } from "../Utils/Manager";
import * as CANNON from "cannon-es";

export class PhysicsManager extends Manager {
  public world = new CANNON.World();

  constructor() {
    super();
  }

  public Start(): void {
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);
    this.world.allowSleep = true;
    this.world.gravity.set(0, -9.82, 0);

    const defaultMaterial = new CANNON.Material("default");
    const defaultContactMaterial = new CANNON.ContactMaterial(
      defaultMaterial,
      defaultMaterial,
      {
        friction: 0,
        restitution: 0,
      }
    );
    this.world.defaultContactMaterial = defaultContactMaterial;
  }

  public Update(delta: number): void {
    this.world.step(1 / 60, delta, 3);
  }

  public Dispose(): void {}
}
