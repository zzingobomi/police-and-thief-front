import {
  BasicCharacterControllerInput,
  IKeyState,
} from "../controllers/player-input";
import { CharacterFSM } from "./character-fsm";
import { FiniteStateMachine } from "./finite-state-machine";

export enum STATE {
  IDLE = "Idle",
  WALK = "Walk",
  RUN = "Run",
  JUMP = "Jump",
}

export class State {
  protected _parent: FiniteStateMachine;
  protected _name: string;

  constructor(parent: FiniteStateMachine) {
    this._parent = parent;
    this._name = "";
  }

  get Name() {
    return this._name;
  }

  public Enter(prevState: State | null) {}
  public Exit() {}
  public Update(time: number, input: BasicCharacterControllerInput) {}
}

export class IdleState extends State {
  constructor(parent: FiniteStateMachine) {
    super(parent);
  }

  get Name() {
    return STATE.IDLE;
  }

  Enter(prevState: State) {
    const idleAction = (this._parent as CharacterFSM).GetAnimation(STATE.IDLE);
    if (prevState) {
      const prevAction = (this._parent as CharacterFSM).GetAnimation(
        prevState.Name
      );
      idleAction.time = 0.0;
      idleAction.enabled = true;
      idleAction.setEffectiveTimeScale(1.0);
      idleAction.setEffectiveWeight(1.0);
      idleAction.crossFadeFrom(prevAction, 0.25, true);
      idleAction.play();
    } else {
      idleAction.play();
    }
  }

  Exit() {}

  Update(time: number, input: BasicCharacterControllerInput) {
    if (input.Keys.forward || input.Keys.backward) {
      this._parent.SetState(STATE.WALK);
    }
  }
}

export class WalkState extends State {
  constructor(parent: FiniteStateMachine) {
    super(parent);
  }

  get Name() {
    return STATE.WALK;
  }

  Enter(prevState: State) {
    const curAction = (this._parent as CharacterFSM).GetAnimation(STATE.WALK);
    if (prevState) {
      const prevAction = (this._parent as CharacterFSM).GetAnimation(
        prevState.Name
      );

      curAction.enabled = true;

      if (prevState.Name == STATE.RUN) {
        const ratio =
          curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.1, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Exit() {}

  Update(time: number, input: BasicCharacterControllerInput) {
    if (input.Keys.forward || input.Keys.backward) {
      if (input.Keys.shift) {
        this._parent.SetState(STATE.RUN);
      }
      return;
    }

    this._parent.SetState(STATE.IDLE);
  }
}

export class RunState extends State {
  constructor(parent: FiniteStateMachine) {
    super(parent);
  }

  get Name() {
    return STATE.RUN;
  }

  Enter(prevState: State) {
    const curAction = (this._parent as CharacterFSM).GetAnimation(STATE.RUN);
    if (prevState) {
      const prevAction = (this._parent as CharacterFSM).GetAnimation(
        prevState.Name
      );

      curAction.enabled = true;

      if (prevState.Name == STATE.WALK) {
        const ratio =
          curAction.getClip().duration / prevAction.getClip().duration;
        curAction.time = prevAction.time * ratio;
      } else {
        curAction.time = 0.0;
        curAction.setEffectiveTimeScale(1.0);
        curAction.setEffectiveWeight(1.0);
      }

      curAction.crossFadeFrom(prevAction, 0.1, true);
      curAction.play();
    } else {
      curAction.play();
    }
  }

  Exit() {}

  Update(time: number, input: BasicCharacterControllerInput) {
    if (input.Keys.forward || input.Keys.backward) {
      if (!input.Keys.shift) {
        this._parent.SetState(STATE.WALK);
      }
      return;
    }

    this._parent.SetState(STATE.IDLE);
  }
}
