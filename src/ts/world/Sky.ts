import * as THREE from "three";
import { IUpdatable } from "./interfaces/IUpdatable";
import { World } from "./World";
import { CSM } from "three-stdlib";
import { SkyShader } from "../../lib/shaders/SkyShader";

// TODO: CSM 분석, 시간과 바라보는 방향에 따른 해의 방향 분석

export class Sky extends THREE.Object3D implements IUpdatable {
  public updateOrder = 5;
  public sunPosition: THREE.Vector3 = new THREE.Vector3();
  public csm: CSM;

  private _phi = 50;
  private _theta = 145;

  private hemiLight: THREE.HemisphereLight;
  private maxHemiIntensity = 0.9;
  private minHemiIntensity = 0.3;

  private skyMesh: THREE.Mesh;
  private skyMaterial: THREE.ShaderMaterial;

  private world: World;

  constructor(world: World) {
    super();
    this.world = world;

    // Sky meterial
    this.skyMaterial = new THREE.ShaderMaterial({
      uniforms: THREE.UniformsUtils.clone(SkyShader.uniforms),
      fragmentShader: SkyShader.fragmentShader,
      vertexShader: SkyShader.vertexShader,
      side: THREE.BackSide,
    });

    // Mesh
    this.skyMesh = new THREE.Mesh(
      new THREE.SphereGeometry(1000, 24, 12),
      this.skyMaterial
    );
    this.attach(this.skyMesh);

    // Ambient light
    this.hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.0);
    this.refreshHemiIntensity();
    this.hemiLight.color.setHSL(0.59, 0.4, 0.6);
    this.hemiLight.groundColor.setHSL(0.095, 0.2, 0.75);
    this.hemiLight.position.set(0, 50, 0);
    this.world.scene.add(this.hemiLight);

    this.refreshSunPosition();

    world.scene.add(this);
  }

  public update(delta: number): void {}

  private refreshSunPosition(): void {
    const sunDistance = 10;

    this.sunPosition.x =
      sunDistance *
      Math.sin((this._theta * Math.PI) / 180) *
      Math.cos((this._phi * Math.PI) / 180);
    this.sunPosition.y = sunDistance * Math.sin((this._phi * Math.PI) / 180);
    this.sunPosition.z =
      sunDistance *
      Math.cos((this._theta * Math.PI) / 180) *
      Math.cos((this._phi * Math.PI) / 180);

    this.skyMaterial.uniforms.sunPosition.value.copy(this.sunPosition);
    this.skyMaterial.uniforms.cameraPos.value.copy(this.world.camera.position);
  }

  private refreshHemiIntensity(): void {
    this.hemiLight.intensity =
      this.minHemiIntensity +
      Math.pow(1 - Math.abs(this._phi - 90) / 90, 0.25) *
        (this.maxHemiIntensity - this.minHemiIntensity);
  }

  set theta(value: number) {
    this._theta = value;
    this.refreshSunPosition();
  }

  set phi(value: number) {
    this._phi = value;
    this.refreshSunPosition();
    this.refreshHemiIntensity();
  }
}
