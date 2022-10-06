import { Object3D } from "three";
import { Component } from "./Component";

interface IComponentMap {
  [key: string]: Component;
}

export class GameObject extends Object3D {
  private active = true;
  private enable = true;
  private tag?: string;
  private components: IComponentMap = {};

  constructor(name: string, tag?: string) {
    super();
    this.name = name;
    this.tag = tag;
  }

  public Start() {
    for (const key in this.components) {
      this.components[key].Start();
    }
  }
  public Update(delta: number) {
    for (const key in this.components) {
      this.components[key].Update(delta);
    }
  }
  public Dispose() {
    for (const key in this.components) {
      this.components[key].Dispose();
    }
  }

  public AddComponent(component: Component) {
    component.GameObject = this;
    this.components[component.constructor.name] = component;
  }
  public GetComponent<T extends Component>(componentType: new () => T): T {
    return this.components[componentType.name] as T;
  }
  public RemoveComponent(name: string) {
    if (this.components[name]) {
      delete this.components[name];
    }
  }

  set Active(active: boolean) {
    this.active = active;
  }
  get Active() {
    return this.active;
  }
  set Enable(enable: boolean) {
    this.enable = enable;
  }
  get Enable() {
    return this.enable;
  }
  set Name(name: string) {
    this.name = name;
  }
  get Name() {
    return this.name;
  }
  set Tag(tag: string | undefined) {
    this.tag = tag;
  }
  get Tag(): string | undefined {
    return this.tag;
  }
  get Uuid() {
    return this.uuid;
  }
}
