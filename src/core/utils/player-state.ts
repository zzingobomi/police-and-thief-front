import { IKeyState } from "../controllers/player-input";
import { FiniteStateMachine } from "./finite-state-machine";

export enum STATE {
  IDLE = "Idle",
  WALK = "Walk",
  RUN = "Run",
  JUMP = "Jump",
}

export class State {
  private _parent: FiniteStateMachine;
  private _name: string;

  constructor(parent: FiniteStateMachine) {
    this._parent = parent;
    this._name = "";
  }

  get Name() {
    return this._name;
  }

  public Enter(prevState: State | null) {}
  public Exit() {}
  public Update(time: number, input: IKeyState) {}
}

export class IdleState extends State {
  constructor(parent: FiniteStateMachine) {
    super(parent);
  }

  get Name() {
    return STATE.IDLE;
  }

  Enter(prevState: State) {
    // const curAction = this._parent._animations["walk"].action;
    //   if (prevState) {
    //     const prevAction = this._parent._animations[prevState.Name].action;
    //     curAction.enabled = true;
    //     if (prevState.Name == "run") {
    //       const ratio =
    //         curAction.getClip().duration / prevAction.getClip().duration;
    //       curAction.time = prevAction.time * ratio;
    //     } else {
    //       curAction.time = 0.0;
    //       curAction.setEffectiveTimeScale(1.0);
    //       curAction.setEffectiveWeight(1.0);
    //     }
    //     curAction.crossFadeFrom(prevAction, 0.1, true);
    //     curAction.play();
    //   } else {
    //     curAction.play();
    //   }
  }

  Exit() {}

  Update(time: number, input: IKeyState) {}
}

export class WalkState extends State {
  constructor(parent: FiniteStateMachine) {
    super(parent);
  }

  get Name() {
    return STATE.WALK;
  }

  Enter(prevState: State) {}

  Exit() {}

  Update(time: number, input: any) {}
}

export class RunState extends State {
  constructor(parent: FiniteStateMachine) {
    super(parent);
  }

  get Name() {
    return STATE.RUN;
  }

  Enter(prevState: State) {}

  Exit() {}

  Update(time: number, input: IKeyState) {}
}
