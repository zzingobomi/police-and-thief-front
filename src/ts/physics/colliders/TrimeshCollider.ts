import { ICollider } from "../../interfaces/ICollider";
import * as CANNON from "cannon-es";
import * as THREE from "three";
import * as Utils from "../../utils/FunctionLibrary";
import { Object3D } from "three";

export class TrimeshCollider implements ICollider {
  public mesh: any;
  public options: any;
  public body: CANNON.Body;

  constructor(mesh: Object3D, options: any) {
    this.mesh = mesh.clone();

    const defaults = {
      mass: 0,
      position: mesh.position,
      rotation: mesh.quaternion,
      friction: 0.3,
    };
    options = Utils.setDefaults(options, defaults);
    this.options = options;

    const mat = new CANNON.Material("triMat");
    mat.friction = options.friction;

    const shape = Utils.createTrimesh(this.mesh.geometry);

    const physBox = new CANNON.Body({
      mass: options.mass,
      position: options.position,
      quaternion: options.rotation,
      shape: shape,
    });

    physBox.material = mat;

    this.body = physBox;
  }
}
