import * as THREE from "three";
import * as CANNON from "cannon-es";
import * as Utils from "../utils/FunctionLibrary";
import PubSub from "pubsub-js";
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
import CannonDebugRenderer from "../utils/CannonDebugRenderer";
import { TrimeshCollider } from "../physics/colliders/TrimeshCollider";
import { Character } from "../characters/Character";
import { IWorldEntity } from "../interfaces/IWorldEntity";
import { IUpdatable } from "../interfaces/IUpdatable";
import * as _ from "lodash";
import { InputManager } from "../core/InputManager";
import { CameraOperator } from "../core/CameraOperator";
import { SignalType } from "../core/SignalType";

export class World {
  public divContainer: HTMLDivElement;
  public renderer: WebGLRenderer;
  public camera: PerspectiveCamera;
  public scene: Scene;

  public sky: Sky;

  //public physicsWorld: CANNON.World;
  //public cannonDebugRenderer: CannonDebugRenderer;

  public inputManager: InputManager;
  public cameraOperator: CameraOperator;
  //private controls: OrbitControls;

  public updatables: IUpdatable[] = [];
  private previousTime = 0;

  constructor() {
    this.divContainer = document.querySelector("#container") as HTMLDivElement;

    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initSignal();
    //this.initPhysics();
    this.initOther();
    this.initWorld();
    this.initBackground();
    this.initLight();

    //this.initDebugRenderer();
    //this.initControls();

    window.onresize = this.resize.bind(this);
    this.resize();

    requestAnimationFrame(this.render.bind(this));
  }

  private initRenderer() {
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    //renderer.toneMapping = THREE.ACESFilmicToneMapping;
    //renderer.toneMappingExposure = 1.0;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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

  private initSignal() {
    PubSub.subscribe(SignalType.CREATE_PLAYER, (msg, data) => {
      const { player, sessionId } = data;
      this.createMyCharacter(player, sessionId);
    });
  }

  // private initPhysics() {
  //   this.physicsWorld = new CANNON.World();
  //   this.physicsWorld.gravity.set(0, -9.81, 0);
  //   this.physicsWorld.broadphase = new CANNON.SAPBroadphase(this.physicsWorld);
  //   //this.physicsWorld.solver.iterations = 10;
  //   this.physicsWorld.allowSleep = true;
  // }

  private initOther() {
    // Initialization
    this.inputManager = new InputManager(this, this.renderer.domElement);
    this.cameraOperator = new CameraOperator(this, this.camera, 0.3);
  }

  private async initWorld() {
    const gltfLoader = new GLTFLoader();
    const gltf = await gltfLoader.loadAsync("./glb/world.glb");
    gltf.scene.traverse((child) => {
      if (child.hasOwnProperty("userData")) {
        if (child.userData.hasOwnProperty("data")) {
          if (child.userData.data === "physics") {
            if (child.userData.hasOwnProperty("type")) {
              child.visible = false;
            }
          }
        }
      }
    });
    this.scene.add(gltf.scene);

    // josn 뽑아내기..
    // const worldInfos: any[] = [];
    // gltf.scene.traverse((child) => {
    //   if (child.hasOwnProperty("userData")) {
    //     if (child.type === "Mesh") {
    //       // TODO: CSM
    //     }

    //     if (child.userData.hasOwnProperty("data")) {
    //       if (child.userData.data === "physics") {
    //         if (child.userData.hasOwnProperty("type")) {
    //           if (child.userData.type === "box") {
    //             const info = {
    //               name: child.name,
    //               type: "box",
    //               position: [
    //                 child.position.x,
    //                 child.position.y,
    //                 child.position.z,
    //               ],
    //               quaternion: [
    //                 child.quaternion.x,
    //                 child.quaternion.y,
    //                 child.quaternion.z,
    //                 child.quaternion.w,
    //               ],
    //               scale: [child.scale.x, child.scale.y, child.scale.z],
    //             };
    //             worldInfos.push(info);

    //             const phys = new BoxCollider({
    //               size: new THREE.Vector3(
    //                 child.scale.x,
    //                 child.scale.y,
    //                 child.scale.z
    //               ),
    //             });
    //             phys.body.position.copy(Utils.cannonVector(child.position));
    //             phys.body.quaternion.copy(Utils.cannonQuat(child.quaternion));
    //             phys.body.updateAABB(); // 회전값대로 AABB를 다시 계산해줘야 raycastHit 이 제대로 작동함

    //             // TODO: 정확한 의미 분석하기
    //             phys.body.shapes.forEach((shape) => {
    //               shape.collisionFilterMask = ~CollisionGroups.TrimeshColliders;
    //             });

    //             //this.physicsWorld.addBody(phys.body);
    //           } else if (
    //             child.userData.type === "trimesh" &&
    //             child instanceof THREE.Mesh
    //           ) {
    //             const vertices: number[] = [];
    //             const indices: number[] = [];
    //             Utils.getGeometryInfo(child.geometry, vertices, indices);
    //             const info = {
    //               name: child.name,
    //               type: "trimesh",
    //               position: [
    //                 child.position.x,
    //                 child.position.y,
    //                 child.position.z,
    //               ],
    //               quaternion: [
    //                 child.quaternion.x,
    //                 child.quaternion.y,
    //                 child.quaternion.z,
    //                 child.quaternion.w,
    //               ],
    //               geometry: {
    //                 vertices: vertices,
    //                 indices: indices,
    //               },
    //             };
    //             worldInfos.push(info);

    //             const phys = new TrimeshCollider(child, {});
    //             //this.physicsWorld.addBody(phys.body);
    //           }

    //           child.visible = false;
    //         }
    //       }

    //       // TODO: scenario 연구
    //       if (child.userData.data === "scenario") {
    //         if (
    //           child.userData.hasOwnProperty("default") &&
    //           child.userData.default === "true"
    //         ) {
    //           child.traverse((scenarioData) => {
    //             if (
    //               scenarioData.hasOwnProperty("userData") &&
    //               scenarioData.userData.hasOwnProperty("data")
    //             ) {
    //               if (scenarioData.userData.data === "spawn") {
    //                 if (scenarioData.userData.type === "player") {
    //                   //this.initCharacter(scenarioData);
    //                 }
    //               }
    //             }
    //           });
    //         }
    //       }
    //     }
    //   }
    // });
    //console.log(JSON.stringify(worldInfos));
  }

  private initLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 0.5).normalize();
    this.scene.add(directionalLight);
  }

  // private initDebugRenderer() {
  //   this.cannonDebugRenderer = new CannonDebugRenderer(
  //     this.scene,
  //     this.physicsWorld
  //   );
  // }

  // private initControls() {
  //   this.controls = new OrbitControls(this.camera, this.divContainer);
  //   this.controls.target.set(0, 20, 0);
  //   this.controls.enablePan = true;
  //   this.controls.enableDamping = false;

  //   this.controls.zoomSpeed = 10;
  // }

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
    //this.updatePhysics(delta);

    this.updatables.forEach((entity) => {
      entity.update(delta);
    });

    // Physics debug
    //this.cannonDebugRenderer.update();
  }

  // private updatePhysics(delta: number) {
  //   this.physicsWorld.step(1 / 60, delta, 3);
  // }

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

  public async createMyCharacter(player: any, sessionId: string) {
    const gltfLoader = new GLTFLoader();
    const model = await gltfLoader.loadAsync("./glb/boxman.glb");
    const myPlayer = new Character(model);

    myPlayer.setPosition(player.position);
    myPlayer.setQuaternion(player.quaternion);
    myPlayer.setScale(player.scale);

    player.position.onChange = (changes: any) => {
      myPlayer.setPosition(player.position);
    };
    player.quaternion.onChange = (changes: any) => {
      myPlayer.setQuaternion(player.quaternion);
    };
    player.scale.onChange = (changes: any) => {
      myPlayer.setScale(player.scale);
    };

    this.add(myPlayer);
    myPlayer.takeControl();

    // const worldPos = new THREE.Vector3();
    // initObject.getWorldPosition(worldPos);
    // console.log(worldPos);
    // player.setPosition(worldPos.x, worldPos.y, worldPos.z);

    // const forward = Utils.getForward(initObject);
    // console.log(forward);
    // player.setOrientation(forward, true);

    // this.add(player);
    // player.takeControl();
  }
}
