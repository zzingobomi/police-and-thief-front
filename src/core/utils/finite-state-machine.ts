import {
  BasicCharacterControllerInput,
  IKeyState,
} from "../controllers/player-input";
import { State } from "./player-state";

class StateMap {
  [key: string]: State;
}

export class FiniteStateMachine {
  private _states: StateMap;
  private _currentState: State | null;

  constructor() {
    this._states = {};
    this._currentState = null;
  }

  public AddState(name: string, type: State) {
    this._states[name] = type;
  }

  public SetState(name: string) {
    const prevState = this._currentState;

    if (prevState) {
      if (prevState.Name == name) {
        return;
      }
      prevState.Exit();
    }

    const state = this._states[name];

    this._currentState = state;
    state.Enter(prevState);
  }

  public Update(time: number, input: BasicCharacterControllerInput) {
    if (this._currentState) {
      this._currentState.Update(time, input);
    }
  }

  public GetCurrentState() {
    return this._currentState;
  }
}
