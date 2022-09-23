import { Entity } from "./entity";

export class Component {
  protected _parent: Entity | null;

  constructor() {
    this._parent = null;
  }

  public SetParent(entity: Entity) {
    this._parent = entity;
  }

  public InitComponent() {}

  public Update(time: number) {}

  public FindEntity(name: string) {
    return this._parent?.FindEntity(name);
  }

  public GetComponent(name: string) {
    return this._parent?.GetComponent(name);
  }

  public Dispose() {}
}
