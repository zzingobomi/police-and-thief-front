import { Component } from "../component";
import { SpatialHashGrid } from "../components/spatial-hash-grid";
import { BASIC_CHARACTER_CONTROLLER, NPC_CONTROLLER } from "../constant";
import { BasicCharacterController } from "./player-entity";
import PubSub from "pubsub-js";
import { SignalType } from "../signal-type";
import { IVec3 } from "../interface/player-data";
import { NpcController } from "./npc-entity";

export class SpatialGridController extends Component {
  private _grid: SpatialHashGrid;
  private _client: any;
  private _player: BasicCharacterController | NpcController | null;

  constructor(grid: any) {
    super();
    this._grid = grid;
    this._player = null;
  }

  public InitComponent(): void {
    const myController = this._parent?.GetComponent(
      BASIC_CHARACTER_CONTROLLER
    ) as BasicCharacterController;
    const npcController = this._parent?.GetComponent(
      NPC_CONTROLLER
    ) as NpcController;
    if (myController) {
      this._player = myController;

      PubSub.subscribe(SignalType.UPDATE_POSITION, (msg, position) => {
        this.onPosition(position);
      });
    } else {
      this._player = npcController;

      PubSub.subscribe(SignalType.NPC_UPDATE_POSITION, (msg, position) => {
        this.onPosition(position);
      });
    }
  }

  public CreateNewClient() {
    if (!this._player) return;
    const pos = [
      this._player.GetInitialPosition()?.x,
      this._player.GetInitialPosition()?.z,
    ];

    this._client = this._grid.NewClient(pos, [1, 1]);
    this._client.entity = this._player;
  }

  private onPosition(position: IVec3) {
    this._client.position = [position.x, position.z];
    this._grid.UpdateClient(this._client);
  }

  public FindNearbyEntities(range: any) {
    const results = this._grid.FindNear(
      [this._player?.GetPosition()?.x, this._player?.GetPosition()?.z],
      [range, range]
    );

    return results.filter((c) => c.entity != this._player);
  }
}
