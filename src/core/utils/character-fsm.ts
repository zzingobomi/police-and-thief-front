import { PlayerType } from "../../pages/room";
import { AnimationMap } from "../controllers/player-entity";
import { FiniteStateMachine } from "./finite-state-machine";
import {
  ChickenDanceState,
  IdleState,
  JumpState,
  PunchState,
  RunState,
  SillyDanceState,
  STATE,
  WalkState,
} from "./player-state";

export class CharacterFSM extends FiniteStateMachine {
  private _playerType: PlayerType;
  private _animations: AnimationMap;

  constructor(animations: AnimationMap, playerType: PlayerType) {
    super();
    this._playerType = playerType;
    this._animations = animations;
    this._init(playerType);
  }

  private _init(playerType: PlayerType) {
    this.AddState(STATE.IDLE, new IdleState(this, playerType));
    this.AddState(STATE.WALK, new WalkState(this, playerType));
    this.AddState(STATE.RUN, new RunState(this, playerType));
    this.AddState(STATE.JUMP, new JumpState(this, playerType));
    if (playerType === PlayerType.POLICE) {
      this.AddState(STATE.SILLY_DANCE, new SillyDanceState(this, playerType));
      this.AddState(STATE.PUNCH, new PunchState(this, playerType));
    } else {
      this.AddState(
        STATE.CHICKEN_DANCE,
        new ChickenDanceState(this, playerType)
      );
    }
  }

  public GetAnimation(name: string) {
    return this._animations[name];
  }

  public GetPlayerType() {
    return this._playerType;
  }
}
