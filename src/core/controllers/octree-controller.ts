import { Component } from "../component";
import { Capsule, Octree } from "three-stdlib";
import { Object3D } from "three";
import { OctreeHelper } from "../js/OctreeHelper.js";
import { THREEJS, THREEJS_CONTROLLER } from "../constant";
import { ThreeJSController } from "./threejs-controller";

export class OctreeController extends Component {
  private _worldOctree: Octree;
  private _worldOctreeHelper: OctreeHelper | null;

  constructor() {
    super();
    this._worldOctree = new Octree();
    this._worldOctreeHelper = null;
  }

  public AddModel(model: Object3D) {
    this._worldOctree.fromGraphNode(model);

    // TODO: helper 들 gui 로 빼기
    // const threejs = this.FindEntity(THREEJS)?.GetComponent(
    //   THREEJS_CONTROLLER
    // ) as ThreeJSController;
    // this._worldOctreeHelper = new OctreeHelper(this._worldOctree);
    // this._worldOctreeHelper.visible = true;
    // threejs.GetScene().add(this._worldOctreeHelper);
  }

  public CapsuleIntersect(capsule: Capsule) {
    return this._worldOctree.capsuleIntersect(capsule);
  }
}
