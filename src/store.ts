import * as Colyseus from "colyseus.js";

export class ColyseusStore {
  private static instance: ColyseusStore;
  private _room: Colyseus.Room | null;

  private constructor() {
    this._room = null;
  }

  public static getInstance() {
    return this.instance || (this.instance = new this());
  }

  public SetRoom(room: Colyseus.Room) {
    this._room = room;
  }
  public GetRoom() {
    return this._room;
  }
}
