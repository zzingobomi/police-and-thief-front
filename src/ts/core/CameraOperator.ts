import { IInputReceiver } from "../interfaces/IInputReceiver";
import { IUpdatable } from "../interfaces/IUpdatable";
import { World } from "../world/World";
import { KeyBinding } from "./KeyBinding";
import * as THREE from "three";
import * as Utils from "../utils/FunctionLibrary";
import * as _ from "lodash";

export class CameraOperator implements IInputReceiver, IUpdatable {
  public updateOrder = 4;

  public world: World;
  public camera: THREE.Camera;
  public target: THREE.Vector3;
  public targetRadius = 1;
  public sensitivity: THREE.Vector2;
  public radius = 1;
  public theta: number;
  public phi: number;

  public movementSpeed: number;
  public actions: { [action: string]: KeyBinding };

  public upVelocity = 0;
  public forwardVelocity = 0;
  public rightVelocity = 0;

  public followMode = false;

  constructor(
    world: World,
    camera: THREE.Camera,
    sensitivityX = 1,
    sensitivityY = sensitivityX * 0.8
  ) {
    this.world = world;
    this.camera = camera;
    this.target = new THREE.Vector3();
    this.sensitivity = new THREE.Vector2(sensitivityX, sensitivityY);

    this.movementSpeed = 0.06;
    this.radius = 3;
    this.theta = 0;
    this.phi = 0;

    this.actions = {
      forward: new KeyBinding("KeyW"),
      back: new KeyBinding("KeyS"),
      left: new KeyBinding("KeyA"),
      right: new KeyBinding("KeyD"),
      up: new KeyBinding("KeyE"),
      down: new KeyBinding("KeyQ"),
      fast: new KeyBinding("ShiftLeft"),
    };

    world.registerUpdatable(this);
    world.inputManager.setInputReceiver(this);
  }

  // targetRadius는 카메라가 회전할때 어떤 반경으로 회전할지..
  public update(delta: number) {
    this.radius = THREE.MathUtils.lerp(this.radius, this.targetRadius, 0.1);

    this.camera.position.x =
      this.target.x +
      this.radius *
        Math.sin((this.theta * Math.PI) / 180) *
        Math.cos((this.phi * Math.PI) / 180);
    this.camera.position.y =
      this.target.y + this.radius * Math.sin((this.phi * Math.PI) / 180);
    this.camera.position.z =
      this.target.z +
      this.radius *
        Math.cos((this.theta * Math.PI) / 180) *
        Math.cos((this.phi * Math.PI) / 180);
    this.camera.updateMatrix();
    this.camera.lookAt(this.target);
  }

  public handleKeyboardEvent(
    event: KeyboardEvent,
    code: string,
    pressed: boolean
  ) {
    for (const action in this.actions) {
      const binding = this.actions[action];

      if (_.includes(binding.eventCodes, code)) {
        binding.isPressed = pressed;
      }
    }
  }
  public handleMouseButton(event: MouseEvent, code: string, pressed: boolean) {}

  public handleMouseMove(event: MouseEvent, deltaX: number, deltaY: number) {
    this.move(deltaX, deltaY);
  }

  public handleMouseWheel(event: WheelEvent, value: number) {}

  public inputReceiverInit() {
    this.target.copy(this.camera.position);
    this.setRadius(0, true);
  }

  public inputReceiverUpdate(delta: number) {
    const speed =
      this.movementSpeed *
      (this.actions.fast.isPressed ? delta * 600 : delta * 60);

    const up = Utils.getUp(this.camera);
    const right = Utils.getRight(this.camera);
    const forward = Utils.getBack(this.camera);

    this.upVelocity = THREE.MathUtils.lerp(
      this.upVelocity,
      +this.actions.up.isPressed - +this.actions.down.isPressed,
      0.3
    );
    this.forwardVelocity = THREE.MathUtils.lerp(
      this.forwardVelocity,
      +this.actions.forward.isPressed - +this.actions.back.isPressed,
      0.3
    );
    this.rightVelocity = THREE.MathUtils.lerp(
      this.rightVelocity,
      +this.actions.right.isPressed - +this.actions.left.isPressed,
      0.3
    );

    this.target.add(up.multiplyScalar(speed * this.upVelocity));
    this.target.add(forward.multiplyScalar(speed * this.forwardVelocity));
    this.target.add(right.multiplyScalar(speed * this.rightVelocity));
  }

  public move(deltaX: number, deltaY: number): void {
    this.theta -= deltaX * (this.sensitivity.x / 2);
    this.theta %= 360;
    this.phi += deltaY * (this.sensitivity.y / 2);
    this.phi = Math.min(85, Math.max(-85, this.phi));
  }

  public setSensitivity(
    sensitivityX: number,
    sensitivityY: number = sensitivityX
  ): void {
    this.sensitivity = new THREE.Vector2(sensitivityX, sensitivityY);
  }

  public setRadius(value: number, instantly = false): void {
    this.targetRadius = Math.max(0.001, value);
    if (instantly === true) {
      this.radius = value;
    }
  }
}
