import { GameObject } from "./GameObject";

export class Component {
  protected gameObject: GameObject;

  public Start() {}
  public Update(delta: number) {}
  public Dispose() {}

  // public GetComponent(component: typeof Component) {
  //   return this.gameObject.GetComponent(component);
  // }
  public GetComponent<T extends Component>(
    componentType: new (...args: any[]) => T
  ): T {
    return this.gameObject.GetComponent(componentType) as T;
  }

  set GameObject(obj: GameObject) {
    this.gameObject = obj;
  }
  get GameObject() {
    return this.gameObject;
  }
}
