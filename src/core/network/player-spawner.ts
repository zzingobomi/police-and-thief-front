import { Component } from "../component";
import { PLAYER } from "../constant";
import { BasicCharacterController } from "../controllers/player-entity";
import { BasicCharacterControllerInput } from "../controllers/player-input";
import { Entity } from "../entity";
import { NetworkEntityController } from "./network-entity-controller";

export class PlayerSpawner extends Component {
  constructor() {
    super();
  }

  // TODO: 서버로 부터 받은 위치 업데이트 하기..? 여기서 해야 하나?
  public Spawn() {
    const player = new Entity();
    player.AddComponent(new BasicCharacterControllerInput());
    player.AddComponent(new BasicCharacterController());
    player.AddComponent(new NetworkEntityController());
    this._parent?.GetManager()?.AddEntity(player, PLAYER);

    return player;
  }
}
