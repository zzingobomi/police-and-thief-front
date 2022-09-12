import { StaticModelComponent } from "./components/object3d-component";
import { OctreeController } from "./controllers/octree-controller";
import { ThreeJSController } from "./controllers/threejs-controller";
import { Entity } from "./entity";
import { EntityManager } from "./entity-manager";
import { PerspectiveCamera, Scene, WebGLRenderer } from "three";
import { OCTREE, SPACE, THREEJS, THREEJS_CONTROLLER } from "./constant";

// TODO: singleton 적용
export class GameMain {
  private _divContainer: HTMLDivElement;
  private _renderer: WebGLRenderer | null;
  private _camera: PerspectiveCamera | null;
  private _scene: Scene | null;

  private _entityManager: EntityManager;

  constructor(container: HTMLDivElement) {
    this._divContainer = container;
    this._renderer = null;
    this._camera = null;
    this._scene = null;
    this._entityManager = new EntityManager();
  }

  public Init() {
    this._loadControllers();
    this._loadSpace();
    this._gameStart();
  }

  private _loadControllers() {
    const threejs = new Entity();
    threejs.AddComponent(new ThreeJSController(this._divContainer));
    this._entityManager.AddEntity(threejs, THREEJS);

    const octree = new Entity();
    octree.AddComponent(new OctreeController());
    this._entityManager.AddEntity(octree, OCTREE);
  }

  private _loadSpace() {
    const space = new Entity();
    space.AddComponent(new StaticModelComponent());
    this._entityManager.AddEntity(space, SPACE);
  }

  private _gameStart() {
    const threejs = this._entityManager
      .GetEntity(THREEJS)
      .GetComponent(THREEJS_CONTROLLER);
    this._renderer = (threejs as ThreeJSController).GetRenderer();
    this._camera = (threejs as ThreeJSController).GetCamera();
    this._scene = (threejs as ThreeJSController).GetScene();

    window.onresize = this.resize.bind(this);
    this.resize();

    requestAnimationFrame(this.render.bind(this));
  }

  render(time: number) {
    this._renderer!.render(this._scene!, this._camera!);
    this.update(time);

    requestAnimationFrame(this.render.bind(this));
  }

  update(time: number) {
    time *= 0.001; // second unit

    this._entityManager.Update(time);
  }

  resize() {
    const width = this._divContainer.clientWidth;
    const height = this._divContainer.clientHeight;

    this._camera!.aspect = width / height;
    this._camera!.updateProjectionMatrix();

    this._renderer!.setSize(width, height);
  }
}
