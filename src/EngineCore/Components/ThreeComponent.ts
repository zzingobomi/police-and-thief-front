import { Component } from "@trixt0r/ecs";
import * as THREE from "three";
import { PerspectiveCamera, Scene, WebGLRenderer } from "three";

export class ThreeComponent implements Component {
  public divContainer: HTMLDivElement;
  public renderer: WebGLRenderer;
  public camera: PerspectiveCamera;
  public scene: Scene;
  constructor(container: HTMLDivElement) {
    this.divContainer = container;

    this.initRenderer();
    this.initScene();
    this.initCamera();
    this.initLight();
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
  private initCamera() {
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.005,
      10000
    );

    camera.position.set(0, 1, 2);
    this.camera = camera;
  }
  private initLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(1, 1, 0.5).normalize();
    this.scene.add(directionalLight);
  }
}
