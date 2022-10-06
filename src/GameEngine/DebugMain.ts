import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import CannonDebugRenderer from "./Utils/CannonDebugRenderer";
import * as CANNON from "cannon-es";
import { ManagerStore } from "./Utils/ManagerStore";
import { RenderingManager } from "./GraphicsSystem/RenderingManager";
import { PhysicsManager } from "./PhysicsSystem/PhysicsManager";

export class DebugMain {
  public divContainer: HTMLDivElement;
  public renderer: WebGLRenderer;
  public camera: PerspectiveCamera;
  private scene: Scene;
  private world: CANNON.World;
  private controls: OrbitControls;
  private cannonDebugRenderer: CannonDebugRenderer;

  private previousTime = 0;

  constructor() {
    this.divContainer = document.querySelector(
      "#debug-container"
    ) as HTMLDivElement;
    this.scene = ManagerStore.GetManager(RenderingManager).scene;
    this.world = ManagerStore.GetManager(PhysicsManager).world;

    this.init();
  }

  private init() {
    this.initRenderer();
    this.initDebugCamera();
    this.initControls();
    this.initCannonDebugRenderer();
    this.resize();

    requestAnimationFrame(this.Render.bind(this));
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
  private initDebugCamera() {
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );

    camera.position.set(0, 3, 6);
    this.camera = camera;
  }
  private initControls() {
    this.controls = new OrbitControls(this.camera, this.divContainer);
    this.controls.target.set(0, 0, 0);
    this.controls.enablePan = true;
    this.controls.enableDamping = false;
  }
  private initCannonDebugRenderer() {
    this.cannonDebugRenderer = new CannonDebugRenderer(this.scene, this.world);
  }

  private resize() {
    const width = this.divContainer.clientWidth;
    const height = this.divContainer.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  public Render(time: number) {
    time *= 0.001; // second unit

    const deltaTime = time - this.previousTime;
    this.renderer.render(this.scene, this.camera);
    this.cannonDebugRenderer.update();
    this.previousTime = time;

    requestAnimationFrame(this.Render.bind(this));
  }

  public Dispose() {}
}
