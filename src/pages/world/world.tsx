import { useEffect, useRef } from "react";
import { GameMain } from "../../GameEngine/GameMain";
import { DebugMain } from "../../GameEngine/DebugMain";

export const World = () => {
  const container = useRef<HTMLDivElement>(null);
  const world = useRef<GameMain>();

  const debugContainer = useRef<HTMLDivElement>(null);
  const debugWorld = useRef<DebugMain>();

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      if (container.current && container.current.children.length > 0) return;
      world.current = new GameMain();
      debugWorld.current = new DebugMain(
        world.current.GetRenderingManager().scene
      );
    }

    return () => {
      world.current?.Dispose();
      isMounted = false;
    };
  });

  return (
    <>
      <div
        id="container"
        ref={container}
        className="absolute w-full h-full top-0 left-0"
      ></div>
      <div
        id="debug-container"
        ref={debugContainer}
        className="absolute w-full h-full top-full left-0"
      ></div>
    </>
  );
};
