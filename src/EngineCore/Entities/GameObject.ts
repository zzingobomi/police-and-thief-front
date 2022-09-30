import { AbstractEntity } from "@trixt0r/ecs";
import { v4 as uuidv4 } from "uuid";

export class GameObject extends AbstractEntity {
  constructor() {
    super(uuidv4());
  }
}
