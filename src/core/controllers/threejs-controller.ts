import { Component } from "../component";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { PerspectiveCamera, Scene, WebGLRenderer } from "three";

export class ThreeJSController extends Component {
  private _divContainer: HTMLDivElement;
  private _renderer: WebGLRenderer;
  private _camera!: PerspectiveCamera;
  private _scene: Scene;

  private _controls!: OrbitControls;

  constructor(container: HTMLDivElement) {
    super();

    this._divContainer = container;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    //renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this._divContainer.appendChild(renderer.domElement);
    this._renderer = renderer;

    const scene = new THREE.Scene();
    this._scene = scene;

    this._setupCamera();
    this._setupLight();
    this._setupControls();
  }

  public GetContainer(): HTMLDivElement {
    return this._divContainer;
  }
  public GetRenderer(): WebGLRenderer {
    return this._renderer;
  }
  public GetScene(): Scene {
    return this._scene;
  }
  public GetCamera(): PerspectiveCamera {
    return this._camera;
  }

  private _setupCamera() {
    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      5000
    );

    camera.position.set(0, 100, 500);
    this._camera = camera;
  }

  private _setupLight() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this._scene.add(ambientLight);

    const shadowLight = new THREE.DirectionalLight(0xffffff, 0.5);
    shadowLight.position.set(200, 500, 200);
    shadowLight.target.position.set(0, 0, 0);
    const directionalLightHelper = new THREE.DirectionalLightHelper(
      shadowLight,
      10
    );
    //this._scene.add(directionalLightHelper);

    this._scene.add(shadowLight);
    this._scene.add(shadowLight.target);

    shadowLight.castShadow = true;
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;
    shadowLight.shadow.camera.top = shadowLight.shadow.camera.right = 1500;
    shadowLight.shadow.camera.bottom = shadowLight.shadow.camera.left = -1500;
    shadowLight.shadow.camera.near = 50;
    shadowLight.shadow.camera.far = 1200;
    shadowLight.shadow.radius = 10;
    const shadowCameraHelper = new THREE.CameraHelper(
      shadowLight.shadow.camera
    );
    //this._scene.add(shadowCameraHelper);
  }

  private _setupControls() {
    this._controls = new OrbitControls(this._camera, this._divContainer);
    this._controls.target.set(0, 100, 0);
    this._controls.enablePan = true;
    this._controls.enableDamping = false;
  }

  update(time: number) {
    this._controls.update();
  }
}