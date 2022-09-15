import * as Colyseus from "colyseus.js";
import PubSub from "pubsub-js";
import { SignalType } from "./core/signal-type";

export class ColyseusStore {
  private static instance: ColyseusStore;
  private _room: Colyseus.Room | null;

  private constructor() {
    this._room = null;
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new ColyseusStore();
    }
    return this.instance;
  }

  public SetRoom(room: Colyseus.Room) {
    this._room = room;
    this._room.state.players.onAdd = (player: any, sessionId: any) => {
      PubSub.publish(SignalType.CREATE_PLAYER, { player, sessionId });
    };
  }
  public GetRoom() {
    return this._room;
  }
}
