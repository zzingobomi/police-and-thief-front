import { useEffect, useRef } from "react";
import { ThreeEngine } from "../../EngineCore/ThreeEngine";
import { ThreeEngineDebug } from "../../EngineCore/ThreeEngineDebug";

export const World = () => {
  const container = useRef<HTMLDivElement>(null);
  const world = useRef<ThreeEngine>();
  const debug = useRef<HTMLDivElement>(null);
  const debugWorld = useRef<ThreeEngineDebug>();

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      if (container.current && container.current.children.length > 0) return;
      world.current = new ThreeEngine(container.current!);
      debugWorld.current = new ThreeEngineDebug(debug.current!);
      const scene = world.current.GetScene();
      debugWorld.current.SetDebugScene(scene!);
    }

    return () => {
      isMounted = false;
    };
  });

  return (
    <>
      <div
        ref={container}
        className="absolute w-full h-full top-0 left-0"
      ></div>
      <div ref={debug} className="absolute w-full h-full top-full left-0"></div>
    </>
  );
};
