import { useEffect, useRef } from "react";
import { GameMain } from "../../GameEngine/GameMain";

export const World = () => {
  const container = useRef<HTMLDivElement>(null);
  const world = useRef<GameMain>();
  //const world = useRef<ThreeEngine>();
  //const debug = useRef<HTMLDivElement>(null);
  //const debugWorld = useRef<ThreeEngineDebug>();

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      if (container.current && container.current.children.length > 0) return;
      world.current = new GameMain();
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
      {/* <div ref={debug} className="absolute w-full h-full top-full left-0"></div> */}
    </>
  );
};
