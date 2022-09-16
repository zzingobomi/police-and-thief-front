import { Component } from "../component";
import {
  BASIC_CHARACTER_CONTROLLER,
  PLAYER,
  THREEJS,
  THREEJS_CONTROLLER,
} from "../constant";
import { BasicCharacterController } from "../controllers/player-entity";
import { BasicCharacterControllerInput } from "../controllers/player-input";
import { ThirdPersonCamera } from "../controllers/third-person-camera";
import { ThreeJSController } from "../controllers/threejs-controller";
import { Entity } from "../entity";
import { IVec3 } from "../interface/player-data";
import { NetworkEntityController } from "./network-entity-controller";

export class PlayerSpawner extends Component {
  constructor() {
    super();
  }

  public Spawn() {
    const player = new Entity();
    player.AddComponent(new BasicCharacterControllerInput());

    const basicCharacterController = new BasicCharacterController();
    player.AddComponent(basicCharacterController);

    player.AddComponent(new NetworkEntityController());

    const threejs = this.FindEntity(THREEJS)?.GetComponent(
      THREEJS_CONTROLLER
    ) as ThreeJSController;
    player.AddComponent(
      new ThirdPersonCamera(threejs.GetCamera(), basicCharacterController)
    );
    this._parent?.GetManager()?.AddEntity(player, PLAYER);

    return player;
  }
}
