import { Component } from "../component";
import * as THREE from "three";
import { OrbitControls } from "three-stdlib";
import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import Stats from "../js/stats.module.js";

export class ThreeJSController extends Component {
  private _divContainer: HTMLDivElement;
  private _renderer: WebGLRenderer;
  private _camera!: PerspectiveCamera;
  private _scene: Scene;

  private _controls!: OrbitControls;

  private _stats = Stats();

  constructor(container: HTMLDivElement) {
    super();

    this._divContainer = container;

    THREE.Cache.enabled = true;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    //renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this._divContainer.appendChild(renderer.domElement);
    this._divContainer.appendChild(this._stats.dom);
    this._renderer = renderer;

    const scene = new THREE.Scene();
    this._scene = scene;

    this._setupCamera();
    this._setupLight();
    this._setupBackground();
    //this._setupControls();
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
      8000
    );

    camera.position.set(0, 100, 500);
    camera.rotation.order = "YXZ";
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

    // TODO: shadow map 크기 helper 로 확인하기
    shadowLight.castShadow = true;
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;
    shadowLight.shadow.camera.top = shadowLight.shadow.camera.right = 1500;
    shadowLight.shadow.camera.bottom = shadowLight.shadow.camera.left = -1500;
    shadowLight.shadow.camera.near = 50;
    shadowLight.shadow.camera.far = 5000;
    shadowLight.shadow.radius = 10;
    const shadowCameraHelper = new THREE.CameraHelper(
      shadowLight.shadow.camera
    );
    //this._scene.add(shadowCameraHelper);
  }

  private _setupBackground() {
    const loader = new THREE.TextureLoader();
    loader.load("./data/clarens_midday_4k.jpeg", (texture) => {
      const renderTarget = new THREE.WebGLCubeRenderTarget(
        texture.image.height
      );
      renderTarget.fromEquirectangularTexture(this._renderer, texture);
      this._scene.background = renderTarget.texture;
    });
  }

  public Update(time: number): void {
    //this._controls.update();
    this._stats.update();
  }

  // private _setupControls() {
  //   this._controls = new OrbitControls(this._camera, this._divContainer);
  //   this._controls.target.set(0, 100, 0);
  //   this._controls.enablePan = true;
  //   this._controls.enableDamping = false;
  // }

  public Dispose(): void {
    while (this._scene.children.length > 0) {
      this._scene.remove(this._scene.children[0]);
    }
  }
}
