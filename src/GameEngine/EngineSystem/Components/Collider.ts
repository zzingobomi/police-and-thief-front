import { Component } from "../Component";
import * as CANNON from "cannon-es";

export class Collider extends Component {
  public shape: CANNON.Shape;
  protected material: CANNON.Material;
}
