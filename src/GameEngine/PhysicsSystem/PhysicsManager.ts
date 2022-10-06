import { GameMain } from "../GameMain";
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

  public Update(delta: number): void {}

  public Dispose(): void {}
}

// export class PhysicsManager extends Manager {
//   private gameMain: GameMain;
//   public physics: AmmoPhysics;

//   constructor(gameMain: GameMain) {
//     this.gameMain = gameMain;
//     PhysicsLoader("/lib/ammo/moz", () => {
//       this.physics = new AmmoPhysics(this.gameMain.GetRenderingManager().scene);
//       this.physics.debug?.enable();
//     });
//   }

//   Update(delta: number) {
//     if (this.physics) this.physics.update(delta);
//   }
// }
