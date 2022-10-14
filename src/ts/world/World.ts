import * as THREE from "three";
import * as CANNON from "cannon-es";
import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { Sky } from "./Sky";

export class World {
  public divContainer: HTMLDivElement;
  public renderer: WebGLRenderer;
  public camera: PerspectiveCamera;
  public scene: Scene;

  public sky: Sky;

  private previousTime = 0;

  constructor() {
    this.divContainer = document.querySelector("#container") as HTMLDivElement;

    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initBackground();
    this.initLight();

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
  }

  private initLight() {}

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
    this.renderer.render(this.scene, this.camera);
    this.previousTime = time;

    requestAnimationFrame(this.render.bind(this));
  }
}
