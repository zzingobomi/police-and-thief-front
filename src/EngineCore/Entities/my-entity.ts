import { AbstractEntity } from "../Core/entity";

let id = 1;

export class MyEntity extends AbstractEntity {
  constructor() {
    super(id++);
  }
}
