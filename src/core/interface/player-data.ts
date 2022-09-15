export interface IVec3 {
  x: number;
  y: number;
  z: number;
}

export interface IPlayerData {
  position: IVec3;
  rotation: IVec3;
  scale: IVec3;
  currentState: string;
}
