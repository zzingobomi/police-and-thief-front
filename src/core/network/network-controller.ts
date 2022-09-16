import { ColyseusStore } from "../../store";
import { Component } from "../component";
import * as Colyseus from "colyseus.js";
import {
  BASIC_CHARACTER_CONTROLLER,
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
import { IVec3 } from "../interface/player-data";
import { BasicCharacterController } from "../controllers/player-entity";

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
        this.playerSpawner(player);
      } else {
        this.npcSpawner(player);
      }
    });
  }

  private playerSpawner(player: any) {
    const spawner = this.FindEntity(SPAWNER)?.GetComponent(
      PLAYER_SPAWNER
    ) as PlayerSpawner;
    const initialPosition: IVec3 = {
      x: player.position.x,
      y: player.position.y,
      z: player.position.z,
    };
    const myPlayer = spawner.Spawn();
    const myController = myPlayer.GetComponent(
      BASIC_CHARACTER_CONTROLLER
    ) as BasicCharacterController;
    myController.SetInitialPosition(initialPosition);
  }

  private npcSpawner(player: any) {
    const npcSpawner = this.FindEntity(SPAWNER)?.GetComponent(
      NETWORK_ENTITY_SPAWNER
    ) as NetworkEntitySpawner;
    const initialPosition: IVec3 = {
      x: player.position.x,
      y: player.position.y,
      z: player.position.z,
    };
    const npcPlayer = npcSpawner.Spawn();
    const npcController = npcPlayer.GetComponent(
      NPC_CONTROLLER
    ) as NpcController;
    npcController.SetInitialPosition(initialPosition);

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