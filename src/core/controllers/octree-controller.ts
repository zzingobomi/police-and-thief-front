import { Component } from "../component";
import { Capsule, Octree } from "three-stdlib";
import { Object3D } from "three";

export class OctreeController extends Component {
  private _worldOctree: Octree;

  constructor() {
    super();
    this._worldOctree = new Octree();
  }

  public AddModel(model: Object3D) {
    this._worldOctree.fromGraphNode(model);
  }

  public CapsuleIntersect(capsule: Capsule) {
    return this._worldOctree.capsuleIntersect(capsule);
  }
}
