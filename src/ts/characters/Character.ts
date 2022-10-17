import * as THREE from "three";
import { EntityType } from "../enums/EntityType";
import { IWorldEntity } from "../interfaces/IWorldEntity";
import { World } from "../world/World";

export class Character extends THREE.Object3D implements IWorldEntity {
  public updateOrder = 1;
  public entityType: EntityType = EntityType.Character;

  constructor(gltf: any) {
    super();
  }

  public addToWorld(world: World) {}

  public removeFromWorld(world: World) {}

  public update(delta: number) {}
}
