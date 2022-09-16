import { Component } from "../component";
import * as Colyseus from "colyseus.js";
import { ColyseusStore } from "../../store";
import { BASIC_CHARACTER_CONTROLLER, PLAYER } from "../constant";
import { BasicCharacterController } from "../controllers/player-entity";
import { IPlayerData } from "../interface/player-data";

export class NetworkEntityController extends Component {
  private _socket: Colyseus.Room | null;

  constructor() {
    super();
    this._socket = ColyseusStore.getInstance().GetRoom();
  }

  public Update(time: number): void {
    /*
    const player = this.FindEntity(PLAYER)?.GetComponent(
      BASIC_CHARACTER_CONTROLLER
    ) as BasicCharacterController;

    const position = player.GetPosition();
    const rotation = player.GetRotation();
    const scale = player.GetScale();
    const currentState = player.GetCurrentState()?.Name;
    if (position && rotation && scale && currentState) {
      const playerInfo: IPlayerData = {
        position,
        rotation,
        scale,
        currentState,
      };
      this._socket?.send("world.update", playerInfo);
    }
    */
  }
}
