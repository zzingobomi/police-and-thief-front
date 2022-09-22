import {
  BasicCharacterControllerInput,
  IKeyState,
} from "../controllers/player-input";
import { CharacterFSM } from "./character-fsm";
import { FiniteStateMachine } from "./finite-state-machine";
import * as THREE from "three";
import { PlayerType } from "../../pages/room";
import { throwServerError } from "@apollo/client";

export enum STATE {
  IDLE = "Idle",
  WALK = "Walk",
  RUN = "Run",
  JUMP = "Jump",
  PUNCH = "Punch",
  SILLY_DANCE = "Silly_Dance",
  CHICKEN_DANCE = "Chicken_Dance",
}

export class State {
  protected _parent: FiniteStateMachine;
  protected _name: string;
  protected _playerType: PlayerType;

  constructor(parent: FiniteStateMachine, playerType: PlayerType) {
    this._parent = parent;
    this._name = "";
    this._playerType = playerType;
  }

  get Name() {
    return this._name;
  }

  public Enter(prevState: State | null) {}
  public Exit() {}
  public Update(time: number, input?: BasicCharacterControllerInput) {}
}

export class IdleState extends State {
  constructor(parent: FiniteStateMachine, playerType: PlayerType) {
    super(parent, playerType);
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

  Update(time: number, input?: BasicCharacterControllerInput) {
    if (!input) {
      return;
    }

    if (this._playerType === PlayerType.POLICE && input.Keys.punch) {
      this._parent.SetState(STATE.PUNCH);
    }
    if (input.Keys.space) {
      this._parent.SetState(STATE.JUMP);
    }
    if (input.Keys.dance) {
      const playerType = (this._parent as CharacterFSM).GetPlayerType();
      this._parent.SetState(
        playerType === PlayerType.POLICE
          ? STATE.SILLY_DANCE
          : STATE.CHICKEN_DANCE
      );
    }

    if (
      input.Keys.forward ||
      input.Keys.backward ||
      input.Keys.left ||
      input.Keys.right
    ) {
      this._parent.SetState(STATE.WALK);
    }
  }
}

export class WalkState extends State {
  constructor(parent: FiniteStateMachine, playerType: PlayerType) {
    super(parent, playerType);
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

  Update(time: number, input?: BasicCharacterControllerInput) {
    if (!input) {
      return;
    }

    if (this._playerType === PlayerType.POLICE && input.Keys.punch) {
      this._parent.SetState(STATE.PUNCH);
    }

    if (input.Keys.space) {
      this._parent.SetState(STATE.JUMP);
      return;
    }

    if (
      input.Keys.forward ||
      input.Keys.backward ||
      input.Keys.left ||
      input.Keys.right
    ) {
      if (input.Keys.shift) {
        this._parent.SetState(STATE.RUN);
      }
      return;
    }

    this._parent.SetState(STATE.IDLE);
  }
}

export class RunState extends State {
  constructor(parent: FiniteStateMachine, playerType: PlayerType) {
    super(parent, playerType);
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

  Update(time: number, input?: BasicCharacterControllerInput) {
    if (!input) {
      return;
    }

    if (this._playerType === PlayerType.POLICE && input.Keys.punch) {
      this._parent.SetState(STATE.PUNCH);
    }

    if (input.Keys.space) {
      this._parent.SetState(STATE.JUMP);
      return;
    }

    if (
      input.Keys.forward ||
      input.Keys.backward ||
      input.Keys.left ||
      input.Keys.right
    ) {
      if (!input.Keys.shift) {
        this._parent.SetState(STATE.WALK);
      }
      return;
    }

    this._parent.SetState(STATE.IDLE);
  }
}

export class JumpState extends State {
  private jumpAction: THREE.AnimationAction | null;
  private prevState: State | null;
  constructor(parent: FiniteStateMachine, playerType: PlayerType) {
    super(parent, playerType);
    this.jumpAction = null;
    this.prevState = null;
  }

  get Name() {
    return STATE.JUMP;
  }

  Enter(prevState: State) {
    this.jumpAction = (this._parent as CharacterFSM).GetAnimation(STATE.JUMP);
    if (prevState) {
      this.prevState = prevState;
      const prevAction = (this._parent as CharacterFSM).GetAnimation(
        prevState.Name
      );
      this.jumpAction.reset();
      this.jumpAction.time = 0.0;
      this.jumpAction.enabled = true;
      this.jumpAction.clampWhenFinished = true;
      this.jumpAction.setEffectiveTimeScale(1.0);
      this.jumpAction.setEffectiveWeight(1.0);
      this.jumpAction.crossFadeFrom(prevAction, 0.25, true);
      this.jumpAction.setDuration(1);
      this.jumpAction.setLoop(THREE.LoopOnce, 1);
      this.jumpAction.play();
    } else {
      this.jumpAction.clampWhenFinished = true;
      this.jumpAction.setLoop(THREE.LoopOnce, 1);
      this.jumpAction.setDuration(1);
      this.jumpAction.play();
    }
  }

  Exit() {}

  Update(time: number, input?: BasicCharacterControllerInput) {
    if (this.jumpAction && this.prevState && !this.jumpAction.isRunning()) {
      this._parent.SetState(this.prevState.Name);
    }
  }
}

export class PunchState extends State {
  private punchAction: THREE.AnimationAction | null;
  private prevStateName: string | null;
  constructor(parent: FiniteStateMachine, playerType: PlayerType) {
    super(parent, playerType);
    this.punchAction = null;
    this.prevStateName = null;
  }

  get Name() {
    return STATE.PUNCH;
  }

  Enter(prevState: State) {
    this.punchAction = (this._parent as CharacterFSM).GetAnimation(STATE.PUNCH);
    if (prevState) {
      this.prevStateName = prevState.Name;
      const prevAction = (this._parent as CharacterFSM).GetAnimation(
        prevState.Name
      );
      this.punchAction.reset();
      this.punchAction.time = 0.0;
      this.punchAction.enabled = true;
      this.punchAction.clampWhenFinished = true;
      this.punchAction.setEffectiveTimeScale(1.0);
      this.punchAction.setEffectiveWeight(1.0);
      this.punchAction.crossFadeFrom(prevAction, 0.25, true);
      this.punchAction.setDuration(0.5);
      this.punchAction.setLoop(THREE.LoopOnce, 1);
      this.punchAction.play();
    } else {
      this.punchAction.clampWhenFinished = true;
      this.punchAction.setLoop(THREE.LoopOnce, 1);
      this.punchAction.setDuration(0.5);
      this.punchAction.play();
    }
  }

  Exit() {}

  Update(time: number, input?: BasicCharacterControllerInput) {
    if (this.punchAction && !this.punchAction.isRunning()) {
      if (this.prevStateName) {
        this._parent.SetState(this.prevStateName);
      } else {
        this._parent.SetState(STATE.IDLE);
      }
    }
  }
}

export class SillyDanceState extends State {
  private sillyDanceAction: THREE.AnimationAction | null;
  constructor(parent: FiniteStateMachine, playerType: PlayerType) {
    super(parent, playerType);
    this.sillyDanceAction = null;
  }

  get Name() {
    return STATE.SILLY_DANCE;
  }

  Enter(prevState: State) {
    if (prevState.Name !== STATE.IDLE) return;
    this.sillyDanceAction = (this._parent as CharacterFSM).GetAnimation(
      STATE.SILLY_DANCE
    );
    if (prevState) {
      const prevAction = (this._parent as CharacterFSM).GetAnimation(
        prevState.Name
      );
      this.sillyDanceAction.reset();
      this.sillyDanceAction.time = 0.0;
      this.sillyDanceAction.enabled = true;
      this.sillyDanceAction.clampWhenFinished = true;
      this.sillyDanceAction.setEffectiveTimeScale(1.0);
      this.sillyDanceAction.setEffectiveWeight(1.0);
      this.sillyDanceAction.crossFadeFrom(prevAction, 0.25, true);
      this.sillyDanceAction.setDuration(3);
      this.sillyDanceAction.setLoop(THREE.LoopOnce, 1);
      this.sillyDanceAction.play();
    } else {
      this.sillyDanceAction.clampWhenFinished = true;
      this.sillyDanceAction.setLoop(THREE.LoopOnce, 1);
      this.sillyDanceAction.setDuration(3);
      this.sillyDanceAction.play();
    }
  }

  Exit() {}

  Update(time: number, input?: BasicCharacterControllerInput) {
    if (!input) {
      return;
    }

    if (
      input.Keys.forward ||
      input.Keys.backward ||
      input.Keys.left ||
      input.Keys.right
    ) {
      this._parent.SetState(STATE.WALK);
    }

    if (this.sillyDanceAction && !this.sillyDanceAction.isRunning()) {
      this._parent.SetState(STATE.IDLE);
    }
  }
}

export class ChickenDanceState extends State {
  private chickenDanceAction: THREE.AnimationAction | null;
  constructor(parent: FiniteStateMachine, playerType: PlayerType) {
    super(parent, playerType);
    this.chickenDanceAction = null;
  }

  get Name() {
    return STATE.CHICKEN_DANCE;
  }

  Enter(prevState: State) {
    if (prevState.Name !== STATE.IDLE) return;
    this.chickenDanceAction = (this._parent as CharacterFSM).GetAnimation(
      STATE.CHICKEN_DANCE
    );
    if (prevState) {
      const prevAction = (this._parent as CharacterFSM).GetAnimation(
        prevState.Name
      );
      this.chickenDanceAction.reset();
      this.chickenDanceAction.time = 0.0;
      this.chickenDanceAction.enabled = true;
      this.chickenDanceAction.clampWhenFinished = true;
      this.chickenDanceAction.setEffectiveTimeScale(1.0);
      this.chickenDanceAction.setEffectiveWeight(1.0);
      this.chickenDanceAction.crossFadeFrom(prevAction, 0.25, true);
      this.chickenDanceAction.setDuration(3);
      this.chickenDanceAction.setLoop(THREE.LoopOnce, 1);
      this.chickenDanceAction.play();
    } else {
      this.chickenDanceAction.clampWhenFinished = true;
      this.chickenDanceAction.setLoop(THREE.LoopOnce, 1);
      this.chickenDanceAction.setDuration(3);
      this.chickenDanceAction.play();
    }
  }

  Exit() {}

  Update(time: number, input?: BasicCharacterControllerInput) {
    if (!input) {
      return;
    }

    if (
      input.Keys.forward ||
      input.Keys.backward ||
      input.Keys.left ||
      input.Keys.right
    ) {
      this._parent.SetState(STATE.WALK);
    }

    if (this.chickenDanceAction && !this.chickenDanceAction.isRunning()) {
      this._parent.SetState(STATE.IDLE);
    }
  }
}
