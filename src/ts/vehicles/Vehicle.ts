import * as THREE from "three";
import * as CANNON from "cannon-es";
import * as _ from "lodash";
import * as Utils from "../utils/FunctionLibrary";
import { IWorldEntity } from "../interfaces/IWorldEntity";
import { EntityType } from "../enums/EntityType";
import { World } from "../world/World";
import { Character } from "../characters/Character";
import { GLTF } from "three-stdlib";
import { CollisionGroups } from "../enums/CollisionGroups";
import { Wheel } from "./Wheel";

export abstract class Vehicle extends THREE.Object3D implements IWorldEntity {
  public updateOrder: number = 2;
  public abstract entityType: EntityType;

  public controllingCharacter: Character;
  public rayCastVehicle: CANNON.RaycastVehicle;
  public world: World | undefined;
  public wheels: Wheel[] = [];
  public help: THREE.AxesHelper;
  public collision: CANNON.Body;

  private modelContainer: THREE.Group;

  constructor(gltf: GLTF, handlingSetup?: any) {
    super();

    if (handlingSetup === undefined) handlingSetup = {};
    (handlingSetup.chassisConnectionPointLocal = new CANNON.Vec3()),
      (handlingSetup.axleLocal = new CANNON.Vec3(-1, 0, 0));
    handlingSetup.directionLocal = new CANNON.Vec3(0, -1, 0);

    // Physics mat
    const mat = new CANNON.Material("Mat");
    mat.friction = 0.01;

    // Collision body
    this.collision = new CANNON.Body({ mass: 50 });
    this.collision.material = mat;

    // Read GLTF
    this.readVehicleData(gltf);

    this.modelContainer = new THREE.Group();
    this.add(this.modelContainer);
    this.modelContainer.add(gltf.scene);

    this.rayCastVehicle = new CANNON.RaycastVehicle({
      chassisBody: this.collision,
      indexUpAxis: 1,
      indexRightAxis: 0,
      indexForwardAxis: 2,
    });

    this.wheels.forEach((wheel) => {
      handlingSetup.chassisConnectionPointLocal.set(
        wheel.position.x,
        wheel.position.y + 0.2,
        wheel.position.z
      );
      const index = this.rayCastVehicle.addWheel(handlingSetup);
      wheel.rayCastWheelInfoIndex = index;
    });

    this.help = new THREE.AxesHelper(2);
  }

  public readVehicleData(gltf: GLTF) {
    gltf.scene.traverse((child) => {
      if (child.hasOwnProperty("userData")) {
        if (child.userData.data === "seat") {
          //
        }
        if (child.userData.data === "camera") {
          //
        }
        if (child.userData.data === "wheel") {
          this.wheels.push(new Wheel(child));
        }
        if (child.userData.data === "collision") {
          if (child.userData.shape === "box") {
            child.visible = false;

            const phys = new CANNON.Box(
              new CANNON.Vec3(child.scale.x, child.scale.y, child.scale.z)
            );
            phys.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
            this.collision.addShape(
              phys,
              new CANNON.Vec3(
                child.position.x,
                child.position.y,
                child.position.z
              )
            );
          } else if (child.userData.shape === "sphere") {
            child.visible = false;

            const phys = new CANNON.Sphere(child.scale.x);
            phys.collisionFilterGroup = CollisionGroups.TrimeshColliders;
            this.collision.addShape(
              phys,
              new CANNON.Vec3(
                child.position.x,
                child.position.y,
                child.position.z
              )
            );
          }
        }
        if (child.userData.data === "navmesh") {
          child.visible = false;
        }
      }
    });
  }

  addToWorld(world: World): void {
    this.world = world;
    world.vehicles.push(this);
    world.scene.add(this);
    this.rayCastVehicle.addToWorld(world.physicsWorld);

    this.wheels.forEach((wheel) => {
      world.scene.attach(wheel.wheelObject);
    });
  }
  removeFromWorld(world: World): void {
    if (!_.includes(world.vehicles, this)) {
      console.warn(
        "Removing character from a world in which it isn't present."
      );
    } else {
      this.world = undefined;
      _.pull(world.vehicles, this);
    }
  }

  public setPosition(x: number, y: number, z: number): void {
    this.collision.position.x = x;
    this.collision.position.y = y;
    this.collision.position.z = z;
  }

  update(delta: number): void {
    this.position.set(
      this.collision.interpolatedPosition.x,
      this.collision.interpolatedPosition.y,
      this.collision.interpolatedPosition.z
    );

    this.quaternion.set(
      this.collision.interpolatedQuaternion.x,
      this.collision.interpolatedQuaternion.y,
      this.collision.interpolatedQuaternion.z,
      this.collision.interpolatedQuaternion.w
    );

    for (let i = 0; i < this.rayCastVehicle.wheelInfos.length; i++) {
      this.rayCastVehicle.updateWheelTransform(i);
      const transform = this.rayCastVehicle.wheelInfos[i].worldTransform;

      const wheelObject = this.wheels[i].wheelObject;
      wheelObject.position.copy(Utils.cannon2threeVector(transform.position));
      wheelObject.quaternion.copy(Utils.cannon2threeQuat(transform.quaternion));

      //let upAxisWorld = new CANNON.Vec3();
      //this.rayCastVehicle.getVehicleAxisWorld(this.rayCastVehicle.indexUpAxis, upAxisWorld);
    }

    this.updateMatrixWorld();
  }

  handleKeyboardEvent(
    event: KeyboardEvent,
    code: string,
    pressed: boolean
  ): void {
    //
  }
  handleMouseButton(event: MouseEvent, code: string, pressed: boolean): void {
    //
  }
  handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number): void {
    //
  }
  handleMouseWheel(event: WheelEvent, value: number): void {
    //
  }
  inputReceiverInit(): void {
    //
  }
  inputReceiverUpdate(delta: number): void {
    //
  }
}
