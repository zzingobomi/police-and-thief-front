import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";

export class ThreeEngineDebug {
  private divContainer: HTMLDivElement;
  private renderer: WebGLRenderer;
  private camera: PerspectiveCamera;
  private scene: Scene;
  private controls: OrbitControls;

  constructor(container: HTMLDivElement) {
    this.divContainer = container;
    this.init();
  }

  private init() {
    this.initRenderer();
  }

  public SetDebugScene(scene: Scene) {
    this.scene = scene;

    this.initDebugCamera();
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

  render(time: number) {
    this.renderer.render(this.scene, this.camera);
    this.update(time);

    requestAnimationFrame(this.render.bind(this));
  }

  update(time: number) {
    time *= 0.001; // second unit

    this.controls.update();
  }

  resize() {
    const width = this.divContainer.clientWidth;
    const height = this.divContainer.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }
}
