import * as THREE from "three";
import * as CANNON from "cannon-es";
import * as Utils from "../utils/FunctionLibrary";
import {
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
  Object3D,
} from "three";
import { Sky } from "./Sky";
import { GLTFLoader } from "three-stdlib";
import { BoxCollider } from "../physics/colliders/BoxCollider";
import { CollisionGroups } from "../enums/CollisionGroups";
import { OrbitControls } from "three-stdlib";
import CannonDebugRenderer from "../utils/CannonDebugRenderer";
import { TrimeshCollider } from "../physics/colliders/TrimeshCollider";
import { Character } from "../characters/Character";
import { IWorldEntity } from "../interfaces/IWorldEntity";
import { IUpdatable } from "../interfaces/IUpdatable";
import * as _ from "lodash";
import { InputManager } from "../core/InputManager";

export class World {
  public divContainer: HTMLDivElement;
  public renderer: WebGLRenderer;
  public camera: PerspectiveCamera;
  public scene: Scene;

  public sky: Sky;

  public physicsWorld: CANNON.World;
  public cannonDebugRenderer: CannonDebugRenderer;

  public inputManager: InputManager;
  private controls: OrbitControls;

  public updatables: IUpdatable[] = [];
  private previousTime = 0;

  constructor() {
    this.divContainer = document.querySelector("#container") as HTMLDivElement;

    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initPhysics();
    this.initOther();
    this.initWorld();
    this.initBackground();
    this.initLight();

    this.initDebugRenderer();
    this.initControls();

    window.onresize = this.resize.bind(this);
    this.resize();

    requestAnimationFrame(this.render.bind(this));
  }

  private initRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    this.divContainer.appendChild(renderer.domElement);
    this.renderer = renderer;
  }

  private initScene() {
    const scene = new THREE.Scene();
    this.scene = scene;
  }

  private initBackground() {
    this.sky = new Sky(this);
  }

  private initCamera() {
    this.camera = new THREE.PerspectiveCamera(
      80,
      window.innerWidth / window.innerHeight,
      0.1,
      1010
    );

    this.camera.position.set(0, 20, 0);
  }

  private initPhysics() {
    this.physicsWorld = new CANNON.World();
    this.physicsWorld.gravity.set(0, -9.81, 0);
    this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld);
    //this.physicsWorld.solver.iterations = 10;
    this.physicsWorld.allowSleep = true;
  }

  private initOther() {
    // Initialization
    this.inputManager = new InputManager(this, this.renderer.domElement);
  }

  private async initWorld() {
    const gltfLoader = new GLTFLoader();
    const gltf = await gltfLoader.loadAsync("./glb/world.glb");
    gltf.scene.traverse((child) => {
      if (child.hasOwnProperty("userData")) {
        if (child.type === "Mesh") {
          // TODO:
        }

        if (child.userData.hasOwnProperty("data")) {
          if (child.userData.data === "physics") {
            if (child.userData.hasOwnProperty("type")) {
              if (child.userData.type === "box") {
                const phys = new BoxCollider({
                  size: new THREE.Vector3(
                    child.scale.x,
                    child.scale.y,
                    child.scale.z
                  ),
                });
                phys.body.position.copy(Utils.cannonVector(child.position));
                phys.body.quaternion.copy(Utils.cannonQuat(child.quaternion));
                //phys.body.computeAABB();

                // TODO: 정확한 의미 분석하기
                phys.body.shapes.forEach((shape) => {
                  shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
                });

                this.physicsWorld.addBody(phys.body);
              } else if (child.userData.type === "trimesh") {
                const phys = new TrimeshCollider(child, {});
                this.physicsWorld.addBody(phys.body);
              }
            }
          }

          // TODO: scenario 연구
          if (child.userData.data === "scenario") {
            if (
              child.userData.hasOwnProperty("default") &&
              child.userData.default === "true"
            ) {
              child.traverse((scenarioData) => {
                if (
                  scenarioData.hasOwnProperty("userData") &&
                  scenarioData.userData.hasOwnProperty("data")
                ) {
                  if (scenarioData.userData.data === "spawn") {
                    if (scenarioData.userData.type === "player") {
                      this.initCharacter(scenarioData);
                    }
                  }
                }
              });
            }
          }
        }
      }
    });

    this.scene.add(gltf.scene);
  }

  private initLight() {}

  private async initCharacter(initObject: Object3D) {
    const gltfLoader = new GLTFLoader();
    const model = await gltfLoader.loadAsync("./glb/boxman.glb");
    const player = new Character(model);

    const worldPos = new THREE.Vector3();
    initObject.getWorldPosition(worldPos);
    player.setPosition(worldPos.x, worldPos.y, worldPos.z);

    const forward = Utils.getForward(initObject);
    player.setOrientation(forward, true);

    this.add(player);
    //player.takeControl();
  }

  private initDebugRenderer() {
    this.cannonDebugRenderer = new CannonDebugRenderer(
      this.scene,
      this.physicsWorld
    );
  }

  private initControls() {
    this.controls = new OrbitControls(this.camera, this.divContainer);
    this.controls.target.set(0, 20, 0);
    this.controls.enablePan = true;
    this.controls.enableDamping = false;

    this.controls.zoomSpeed = 10;
  }

  private resize() {
    const width = this.divContainer.clientWidth;
    const height = this.divContainer.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  private render(time: number) {
    time *= 0.001; // second unit

    const deltaTime = time - this.previousTime;

    // Logic
    this.update(deltaTime);

    // Rendering
    this.renderer.render(this.scene, this.camera);
    this.previousTime = time;

    requestAnimationFrame(this.render.bind(this));
  }

  private update(delta: number) {
    this.updatePhysics(delta);

    this.updatables.forEach((entity) => {
      entity.update(delta);
    });

    // Physics debug
    this.cannonDebugRenderer.update();
  }

  private updatePhysics(delta: number) {
    this.physicsWorld.step(1 / 60, delta, 3);
  }

  public add(worldEntity: IWorldEntity): void {
    worldEntity.addToWorld(this);
    this.registerUpdatable(worldEntity);
  }

  public registerUpdatable(registree: IUpdatable): void {
    this.updatables.push(registree);
    this.updatables.sort((a, b) => (a.updateOrder > b.updateOrder ? 1 : -1));
  }

  public remove(worldEntity: IWorldEntity): void {
    worldEntity.removeFromWorld(this);
    this.unregisterUpdatable(worldEntity);
  }

  public unregisterUpdatable(registree: IUpdatable): void {
    _.pull(this.updatables, registree);
  }
}
