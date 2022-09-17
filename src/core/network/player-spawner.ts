import { Component } from "../component";
import { SpatialHashGrid } from "../components/spatial-hash-grid";
import {
  BASIC_CHARACTER_CONTROLLER,
  HASH_GRID,
  PLAYER,
  SPATIAL_HASH_GRID,
  THREEJS,
  THREEJS_CONTROLLER,
} from "../constant";
import { FirstPersonCamera } from "../controllers/first-person-camera";
import { BasicCharacterController } from "../controllers/player-entity";
import { BasicCharacterControllerInput } from "../controllers/player-input";
import { SpatialGridController } from "../controllers/spatial-grid-controller";
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
    player.AddComponent(new BasicCharacterController());
    player.AddComponent(new NetworkEntityController());
    player.AddComponent(new FirstPersonCamera());

    const grid = this.FindEntity(HASH_GRID)?.GetComponent(
      SPATIAL_HASH_GRID
    ) as SpatialHashGrid;
    player.AddComponent(new SpatialGridController(grid));

    this._parent?.GetManager()?.AddEntity(player, PLAYER);

    return player;
  }
}
