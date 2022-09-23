import { Component } from "./component";
import * as THREE from "three";
import { EntityManager } from "./entity-manager";
import { Quaternion, Vector3 } from "three";

class ComponentMap {
  [key: string]: Component;
}

export class Entity {
  protected _manager: EntityManager | null;
  private _name: string | null;
  private _components: ComponentMap;

  private _position: THREE.Vector3;
  private _rotation: THREE.Quaternion;

  constructor() {
    this._manager = null;
    this._name = null;
    this._components = {};

    this._position = new THREE.Vector3();
    this._rotation = new THREE.Quaternion();
  }

  public InitEntity() {
    for (const key in this._components) {
      this._components[key].InitComponent();
    }
  }

  public AddComponent(component: Component): void {
    component.SetParent(this);
    this._components[component.constructor.name] = component;

    // TODO: Plant UML 그려보면서 다시 확인하기
    //component.InitComponent();
  }

  public GetComponent(name: string): Component {
    return this._components[name];
  }

  public GetManager() {
    return this._manager;
  }
  public SetManager(manager: EntityManager) {
    this._manager = manager;
  }

  public SetName(name: string) {
    this._name = name;
  }

  public Update(time: number) {
    for (const key in this._components) {
      this._components[key].Update(time);
    }
  }

  public FindEntity(name: string) {
    return this._manager?.GetEntity(name);
  }

  public SetPosition(positon: Vector3) {
    this._position.copy(positon);
  }

  public SetQuaternion(rotation: Quaternion) {
    this._rotation.copy(rotation);
  }

  public Dispose() {
    for (const key in this._components) {
      this._components[key].Dispose();
    }
  }
}
