import { AnimationMap } from "../controllers/player-entity";
import { FiniteStateMachine } from "./finite-state-machine";
import { IdleState, RunState, STATE, WalkState } from "./player-state";

export class CharacterFSM extends FiniteStateMachine {
  private _animations: AnimationMap;

  constructor(animations: AnimationMap) {
    super();
    this._animations = animations;
    this._init();
  }

  private _init() {
    this.AddState(STATE.IDLE, new IdleState(this));
    this.AddState(STATE.WALK, new WalkState(this));
    this.AddState(STATE.RUN, new RunState(this));
  }
}
