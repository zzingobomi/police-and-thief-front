import { Manager } from "./Manager";

interface IManagerMap {
  [key: string]: Manager;
}

export class ManagerStore {
  private managers: IManagerMap = {};
  static managerMap: Map<string, Manager> = new Map();

  public AddManager(manager: Manager) {
    this.managers[manager.constructor.name] = manager;
    ManagerStore.managerMap.set(manager.constructor.name, manager);
  }

  public Start() {
    for (const key in this.managers) {
      this.managers[key].Start();
    }
  }
  public Update(delta: number) {
    for (const key in this.managers) {
      this.managers[key].Update(delta);
    }
  }
  public Dispose() {
    for (const key in this.managers) {
      this.managers[key].Dispose();
    }
  }

  static GetManager<T extends Manager>(managerType: new () => T): T {
    return this.managerMap.get(managerType.name) as T;
  }
}
