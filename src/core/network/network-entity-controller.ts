import { Component } from "../component";
import * as Colyseus from "colyseus.js";
import { ColyseusStore } from "../../store";
import { BASIC_CHARACTER_CONTROLLER, PLAYER } from "../constant";
import { BasicCharacterController } from "../controllers/player-entity";
import { IPlayerData, IVec3 } from "../interface/player-data";
import PubSub from "pubsub-js";
import { SignalType } from "../signal-type";

export class NetworkEntityController extends Component {
  private _socket: Colyseus.Room | null;
  private _pubsubTokens: string[] = [];

  constructor() {
    super();
    this._socket = ColyseusStore.getInstance().GetRoom();
  }

  public InitComponent(): void {
    this._pubsubTokens.push(
      PubSub.subscribe(SignalType.UPDATE_POSITION, (msg, position) => {
        this.sendUpdatePosition(position);
      })
    );
    this._pubsubTokens.push(
      PubSub.subscribe(SignalType.UPDATE_ROTATION, (msg, rotation) => {
        this.sendUpdateRotation(rotation);
      })
    );
    this._pubsubTokens.push(
      PubSub.subscribe(SignalType.UPDATE_STATE, (msg, state) => {
        this.sendUpdateState(state);
      })
    );
    this._pubsubTokens.push(
      PubSub.subscribe(SignalType.CATCH_THIEF, (msg, sessionId) => {
        this.sendCatchThief(sessionId);
      })
    );
  }

  public Dispose(): void {
    for (const token of this._pubsubTokens) {
      PubSub.unsubscribe(token);
    }
  }

  private sendUpdatePosition(position: IVec3) {
    this._socket?.send("update.position", position);
  }
  private sendUpdateRotation(rotation: IVec3) {
    this._socket?.send("update.rotation", rotation);
  }
  private sendUpdateState(state: string) {
    this._socket?.send("update.state", state);
  }
  private sendCatchThief(sessionId: string) {
    this._socket?.send("catch.thief", sessionId);
  }
}
