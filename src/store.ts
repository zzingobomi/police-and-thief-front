import * as Colyseus from "colyseus.js";
import PubSub from "pubsub-js";
import { SignalType } from "./ts/core/SignalType";

export class ColyseusStore {
  private static instance: ColyseusStore;
  private room: Colyseus.Room | null;

  private constructor() {
    this.room = null;
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new ColyseusStore();
    }
    return this.instance;
  }

  public SetRoom(room: Colyseus.Room) {
    this.room = room;
    this.room.state.players.onAdd = (player: any, sessionId: any) => {
      //console.log("onAdd");
      PubSub.publish(SignalType.CREATE_PLAYER, { player, sessionId });
    };
  }
  public GetRoom() {
    return this.room;
  }
}
