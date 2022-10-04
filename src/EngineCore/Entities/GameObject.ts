import { AbstractEntity } from "../Core/entity";
import { v4 as uuidv4 } from "uuid";

export class GameObject extends AbstractEntity {
  private name: string;
  private tag?: string;

  static nameMap: Map<string, GameObject> = new Map();
  static tagMap: Map<string, GameObject[]> = new Map();

  constructor(name: string, tag?: string) {
    super(uuidv4());
    this.name = name;
    this.tag = tag;

    GameObject.nameMap.set(name, this);
  }

  get ID() {
    return this.id;
  }
  get Name() {
    return this.name;
  }
  get Tag() {
    return this.tag;
  }

  static Find(name: string) {
    return this.nameMap.get(name);
  }
  static FindWithTag(name: string) {
    // TODO: FindWithTag
  }
}
