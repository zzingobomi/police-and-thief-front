import { PlayerType } from "../../pages/room";
import { Component } from "../component";
import { SpatialHashGrid } from "../components/spatial-hash-grid";
import { HASH_GRID, NPC_PLAYER, SPATIAL_HASH_GRID } from "../constant";
import { NpcController } from "../controllers/npc-entity";
import { SpatialGridController } from "../controllers/spatial-grid-controller";
import { Entity } from "../entity";

export class NetworkEntitySpawner extends Component {
  constructor() {
    super();
  }

  public Spawn(playerType: PlayerType, nickname: string, sessionId: string) {
    const npc = new Entity();
    npc.AddComponent(new NpcController(playerType, nickname, sessionId));

    const grid = this.FindEntity(HASH_GRID)?.GetComponent(
      SPATIAL_HASH_GRID
    ) as SpatialHashGrid;
    npc.AddComponent(new SpatialGridController(grid));

    this._parent?.GetManager()?.AddEntity(npc, NPC_PLAYER);

    return npc;
  }
}
