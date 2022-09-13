import { createContext } from "react";
import * as Colyseus from "colyseus.js";

export interface IColyseusProviderProps {
  client: Colyseus.Client | null;
}

export const colyseusDefault = { client: null };
export const colyseusContext =
  createContext<IColyseusProviderProps>(colyseusDefault);
