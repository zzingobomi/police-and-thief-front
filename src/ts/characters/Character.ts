import * as THREE from "three";
import * as CANNON from "cannon-es";
import { KeyBinding } from "../core/KeyBinding";
import { EntityType } from "../enums/EntityType";
import { IWorldEntity } from "../interfaces/IWorldEntity";
import { CapsuleCollider } from "../physics/colliders/CapsuleCollider";
import { World } from "../world/World";
import { CollisionGroups } from "../enums/CollisionGroups";
import * as Utils from "../utils/FunctionLibrary";

export class Character extends THREE.Object3D implements IWorldEntity {
  public updateOrder = 1;
  public entityType: EntityType = EntityType.Character;

  public height = 0;
  public tiltContainer: THREE.Group;
  public modelContainer: THREE.Group;
  public mixer: THREE.AnimationMixer;

  // Movement
  public acceleration: THREE.Vector3 = new THREE.Vector3();
  public velocity: THREE.Vector3 = new THREE.Vector3();
  public arcadeVelocityInfluence: THREE.Vector3 = new THREE.Vector3();
  public velocityTarget: THREE.Vector3 = new THREE.Vector3();
  public arcadeVelocityIsAdditive = false;

  public orientation: THREE.Vector3 = new THREE.Vector3(0, 0, 1);
  public orientationTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 1);

  public actions: { [action: string]: KeyBinding };
  public characterCapsule: CapsuleCollider;

  // Ray casting
  public rayResult: CANNON.RaycastResult = new CANNON.RaycastResult();
  public rayHasHit = false;
  public rayCastLength = 0.57;
  public raySafeOffset = 0.03;
  public raycastBox: THREE.Mesh;

  public world: World;

  private physicsEnabled = true;

  constructor(gltf: any) {
    super();

    this.tiltContainer = new THREE.Group();
    this.add(this.tiltContainer);

    this.modelContainer = new THREE.Group();
    this.modelContainer.position.y = -0.57;
    this.tiltContainer.add(this.modelContainer);
    this.modelContainer.add(gltf.scene);

    this.mixer = new THREE.AnimationMixer(gltf.scene);

    // Actions
    this.actions = {
      up: new KeyBinding("KeyW"),
      down: new KeyBinding("KeyS"),
      left: new KeyBinding("KeyA"),
      right: new KeyBinding("KeyD"),
      run: new KeyBinding("ShiftLeft"),
      jump: new KeyBinding("Space"),
      use: new KeyBinding("KeyE"),
      enter: new KeyBinding("KeyF"),
      enter_passenger: new KeyBinding("KeyG"),
      seat_switch: new KeyBinding("KeyX"),
      primary: new KeyBinding("Mouse0"),
      secondary: new KeyBinding("Mouse1"),
    };

    // Physics
    // Player Capsule
    this.characterCapsule = new CapsuleCollider({
      mass: 1,
      position: new CANNON.Vec3(),
      height: 0.5,
      radius: 0.25,
      segments: 8,
      friction: 0.0,
    });
    // TODO: 정확한 의미..
    this.characterCapsule.body.shapes.forEach((shape) => {
      shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
    });
    this.characterCapsule.body.allowSleep = false;

    // Move character to different collision group for raycasting
    this.characterCapsule.body.collisionFilterGroup =
      CollisionGroups.Characters;

    // Disable character rotation
    this.characterCapsule.body.fixedRotation = true;
    this.characterCapsule.body.updateMassProperties();

    // Ray cast debug
    const boxGeo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const boxMat = new THREE.MeshLambertMaterial({
      color: 0xff0000,
    });
    this.raycastBox = new THREE.Mesh(boxGeo, boxMat);
    this.raycastBox.visible = true;

    // cannon-es latest version에서는 preStep, postStep 없어짐..
    this.characterCapsule.body.preStep = () => {
      this.physicsPreStep();
    };
    this.characterCapsule.body.postStep = () => {
      this.physicsPostStep();
    };
  }

  public tt() {
    console.log(this.characterCapsule);
  }

  public addToWorld(world: World) {
    this.world = world;

    world.physicsWorld.addBody(this.characterCapsule.body);

    world.scene.add(this);
    world.scene.add(this.raycastBox);
  }

  public removeFromWorld(world: World) {}

  public update(delta: number) {
    if (this.physicsEnabled) {
      this.position.set(
        this.characterCapsule.body.interpolatedPosition.x,
        this.characterCapsule.body.interpolatedPosition.y,
        this.characterCapsule.body.interpolatedPosition.z
      );
    }
  }

  public setPosition(x: number, y: number, z: number) {
    if (this.physicsEnabled) {
      this.characterCapsule.body.previousPosition = new CANNON.Vec3(x, y, z);
      this.characterCapsule.body.position = new CANNON.Vec3(x, y, z);
      this.characterCapsule.body.interpolatedPosition = new CANNON.Vec3(
        x,
        y,
        z
      );
    } else {
      this.position.x = x;
      this.position.y = y;
      this.position.z = z;
    }
  }

  public setOrientation(vector: THREE.Vector3, instantly = false): void {
    const lookVector = new THREE.Vector3().copy(vector).setY(0).normalize();
    this.orientationTarget.copy(lookVector);

    if (instantly) {
      this.orientation.copy(lookVector);
    }
  }

  public physicsPreStep() {
    this.feetRaycast();

    if (this.rayHasHit) {
      if (this.raycastBox.visible) {
        this.raycastBox.position.x = this.rayResult.hitPointWorld.x;
        this.raycastBox.position.y = this.rayResult.hitPointWorld.y;
        this.raycastBox.position.z = this.rayResult.hitPointWorld.z;
      }
    } else {
      if (this.raycastBox.visible) {
        this.raycastBox.position.set(
          this.characterCapsule.body.position.x,
          this.characterCapsule.body.position.y -
            this.rayCastLength -
            this.raySafeOffset,
          this.characterCapsule.body.position.z
        );
      }
    }
  }

  public feetRaycast() {
    const body = this.characterCapsule.body;
    const start = new CANNON.Vec3(
      body.position.x,
      body.position.y,
      body.position.z
    );
    const end = new CANNON.Vec3(
      body.position.x,
      body.position.y - this.rayCastLength - this.raySafeOffset,
      body.position.z
    );
    const rayCastOptions = {
      collisionFilterMask: CollisionGroups.Default, // 어떤 collisionGroup 이랑 반응할것인지
      skipBackfaces: true /* ignore back faces */,
    };
    this.rayHasHit = this.world.physicsWorld.raycastClosest(
      start,
      end,
      rayCastOptions,
      this.rayResult
    );
  }

  public physicsPostStep(): void {
    const newVelocity = new THREE.Vector3();

    if (this.rayHasHit) {
      newVelocity.y = 0;
      // TODO: Move on top of moving objects

      // Measure the normal vector offset from direct "up" vector
      // and transform it into a matrix
      const up = new THREE.Vector3(0, 1, 0);
      const normal = new THREE.Vector3(
        this.rayResult.hitNormalWorld.x,
        this.rayResult.hitNormalWorld.y,
        this.rayResult.hitNormalWorld.z
      );
      const q = new THREE.Quaternion().setFromUnitVectors(up, normal);
      const m = new THREE.Matrix4().makeRotationFromQuaternion(q);
      // Rotate the velocity vector
      newVelocity.applyMatrix4(m);
      // Compensate for gravity
      // newVelocity.y -= body.world.physicsWorld.gravity.y / body.character.world.physicsFrameRate;
      // Apply velocity
      this.characterCapsule.body.velocity.x = newVelocity.x;
      this.characterCapsule.body.velocity.y = newVelocity.y;
      this.characterCapsule.body.velocity.z = newVelocity.z;
      // Ground character
      this.characterCapsule.body.position.y =
        this.rayResult.hitPointWorld.y +
        this.rayCastLength +
        newVelocity.y / 60;
    } else {
      // If we're in air
      this.characterCapsule.body.velocity.x = newVelocity.x;
      this.characterCapsule.body.velocity.y = newVelocity.y;
      this.characterCapsule.body.velocity.z = newVelocity.z;
    }
  }
}
