import { Component } from "../Core/component";
import * as THREE from "three";
import { PerspectiveCamera, Scene, WebGLRenderer } from "three";

const vertexShader = `
  varying vec3 vWorldPosition;
  
  void main() {
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
    vWorldPosition = worldPosition.xyz;
  
    gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
  }`;

const fragmentShader = `
  uniform vec3 topColor;
  uniform vec3 bottomColor;
  uniform float offset;
  uniform float exponent;  
  
  varying vec3 vWorldPosition;
  
  void main() {
    float h = normalize( vWorldPosition + offset ).y;
    gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( max( h , 0.0), exponent ), 0.0 ) ), 1.0 );
  }`;

export class ThreeComponent implements Component {
  public divContainer: HTMLDivElement;
  public renderer: WebGLRenderer;
  public camera: PerspectiveCamera;
  public scene: Scene;
  constructor(container: HTMLDivElement) {
    this.divContainer = container;

    this.initRenderer();
    this.initScene();
    this.initBackground();
    this.initMainCamera();
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
  private initBackground() {
    const uniforms = {
      topColor: { value: new THREE.Color(0x0077ff) },
      bottomColor: { value: new THREE.Color(0xedf5ff) },
      offset: { value: 33 },
      exponent: { value: 0.6 },
    };

    const skyGeo = new THREE.SphereGeometry(500, 32, 15);
    const skyMat = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      side: THREE.BackSide,
    });

    const sky = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(sky);
  }
  private initMainCamera() {
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
