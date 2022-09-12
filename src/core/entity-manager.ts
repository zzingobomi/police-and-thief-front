import { Entity } from "./entity";

class EntityMap {
  [key: string]: Entity;
}

export class EntityManager {
  private _entitiesMap: EntityMap;
  private _entities: Entity[];

  constructor() {
    this._entitiesMap = {};
    this._entities = [];
  }

  public GetEntity(name: string): Entity {
    return this._entitiesMap[name];
  }

  public AddEntity(entity: Entity, name: string) {
    this._entitiesMap[name] = entity;
    this._entities.push(entity);

    entity.SetManager(this);
    entity.SetName(name);
    entity.InitEntity();
  }

  public Update(time: number) {
    for (const entity of this._entities) {
      entity.Update(time);
    }
  }
}
