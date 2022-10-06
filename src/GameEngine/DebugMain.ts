import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

export class DebugMain {
  public divContainer: HTMLDivElement;
  public renderer: WebGLRenderer;
  public camera: PerspectiveCamera;
  private scene: Scene;
  private controls: OrbitControls;

  private previousTime = 0;

  constructor(scene: Scene) {
    this.divContainer = document.querySelector(
      "#debug-container"
    ) as HTMLDivElement;
    this.scene = scene;

    this.init();
  }

  private init() {
    this.initRenderer();
    this.initDebugCamera();
    this.initControls();
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
      60,
      window.innerWidth / window.innerHeight,
      0.005,
      10000
    );

    camera.position.set(0, 1, 2);
    this.camera = camera;
  }
  private initControls() {
    this.controls = new OrbitControls(this.camera, this.divContainer);
    this.controls.target.set(0, 0, 0);
    this.controls.enablePan = true;
    this.controls.enableDamping = false;
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
    this.previousTime = time;

    requestAnimationFrame(this.Render.bind(this));
  }

  public Dispose() {}
}
