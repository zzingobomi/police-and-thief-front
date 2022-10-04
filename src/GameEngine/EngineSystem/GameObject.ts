import { Component } from "./Component";

interface IComponentMap {
  [key: string]: Component;
}

export class GameObject {
  private active = true;
  private enable = true;
  private name: string;
  private tag?: string;
  private parent: GameObject;
  private components: IComponentMap = {};

  static nameMap: Map<string, GameObject> = new Map();

  constructor(name: string, tag?: string) {
    this.name = name;
    this.tag = tag;

    GameObject.nameMap.set(name, this);
  }

  public Awake() {}
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
  public Render() {
    for (const key in this.components) {
      this.components[key].Render();
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
  public GetComponent(name: string) {
    return this.components[name];
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

  static Find(name: string) {
    return this.nameMap.get(name);
  }
}
