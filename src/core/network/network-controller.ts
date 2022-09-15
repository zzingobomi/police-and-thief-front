import { ColyseusStore } from "../../store";
import { Component } from "../component";
import * as Colyseus from "colyseus.js";
import {
  NETWORK_ENTITY_SPAWNER,
  NPC_CONTROLLER,
  PLAYER_SPAWNER,
  SPAWNER,
} from "../constant";
import { PlayerSpawner } from "./player-spawner";
import { NetworkEntitySpawner } from "./network-entity-spawner";
import PubSub from "pubsub-js";
import { SignalType } from "../signal-type";
import { NpcController } from "../controllers/npc-entity";

export class NetworkController extends Component {
  private _socket: Colyseus.Room | null;
  constructor() {
    super();
    this._socket = ColyseusStore.getInstance().GetRoom();
  }

  public InitComponent(): void {
    PubSub.subscribe(SignalType.CREATE_PLAYER, (msg, data) => {
      const { player, sessionId } = data;
      if (this._socket?.sessionId === sessionId) {
        console.log("내캐릭터");
        this.playerSpawner();
      } else {
        console.log("상대캐릭터");
        this.npcSpawner(player);
      }
    });
  }

  private playerSpawner() {
    const spawner = this.FindEntity(SPAWNER)?.GetComponent(
      PLAYER_SPAWNER
    ) as PlayerSpawner;
    const myPlayer = spawner.Spawn();
  }

  private npcSpawner(player: any) {
    const npcSpawner = this.FindEntity(SPAWNER)?.GetComponent(
      NETWORK_ENTITY_SPAWNER
    ) as NetworkEntitySpawner;
    const npcPlayer = npcSpawner.Spawn();
    const npcController = npcPlayer.GetComponent(
      NPC_CONTROLLER
    ) as NpcController;

    // TODO: 왜 뚫고 지나가지?
    player.onChange = (changes: any) => {
      changes.forEach((change: any) => {
        if (change.field === "currentState") {
          npcController.SetCurrentState(change.value);
        }
      });
    };
    player.position.onChange = (changes: any) => {
      npcController.SetPosition({
        x: player.position.x,
        y: player.position.y,
        z: player.position.z,
      });
    };
    player.rotation.onChange = (changes: any) => {
      npcController.SetRotation({
        x: player.rotation.x,
        y: player.rotation.y,
        z: player.rotation.z,
      });
    };
  }

  public GetSocket() {
    return this._socket;
  }
}
