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

  constructor() {
    super();
    this._socket = ColyseusStore.getInstance().GetRoom();
  }

  public InitComponent(): void {
    PubSub.subscribe(SignalType.UPDATE_POSITION, (msg, position) => {
      this.sendUpdatePosition(position);
    });
    PubSub.subscribe(SignalType.UPDATE_ROTATION, (msg, rotation) => {
      this.sendUpdateRotation(rotation);
    });
    PubSub.subscribe(SignalType.UPDATE_STATE, (msg, state) => {
      this.sendUpdateState(state);
    });
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
}
