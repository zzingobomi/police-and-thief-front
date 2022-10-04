import { GameObject } from "./GameObject";

export class Component {
  private gameObject: GameObject;

  public Start() {}
  public Update(delta: number) {}
  public Render() {}
  public Dispose() {}

  // TODO:
  //public GetComponent

  set GameObject(obj: GameObject) {
    this.gameObject = obj;
  }
  get GameObject() {
    return this.gameObject;
  }
}
