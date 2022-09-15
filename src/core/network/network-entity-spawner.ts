import { Component } from "../component";
import { NPC_PLAYER } from "../constant";
import { NpcController } from "../controllers/npc-entity";
import { Entity } from "../entity";

export class NetworkEntitySpawner extends Component {
  constructor() {
    super();
  }

  public Spawn() {
    const npc = new Entity();
    npc.AddComponent(new NpcController());
    //npc.AddComponent(new NetworkEntityController());
    this._parent?.GetManager()?.AddEntity(npc, NPC_PLAYER);

    return npc;
  }
}
