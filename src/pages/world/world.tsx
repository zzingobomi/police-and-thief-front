import { useEffect, useRef } from "react";
import { ThreeEngine } from "../../EngineCore/ThreeEngine";

export const World = () => {
  const container = useRef<HTMLDivElement>(null);
  const world = useRef<ThreeEngine>();

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      if (container.current && container.current.children.length > 0) return;
      world.current = new ThreeEngine(container.current!);
    }

    return () => {
      isMounted = false;
    };
  });

  return (
    <div ref={container} className="absolute w-full h-full top-0 left-0"></div>
  );
};
