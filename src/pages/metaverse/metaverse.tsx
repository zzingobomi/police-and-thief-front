import { useEffect, useRef } from "react";
import { World } from "../../ts/world/World";

export const Metaverse = () => {
  const container = useRef<HTMLDivElement>(null);
  const metaworld = useRef<World>();

  useEffect(() => {
    let isMounted = true;
    if (isMounted) {
      if (container.current && container.current.children.length > 0) return;
      metaworld.current = new World();
    }

    return () => {
      isMounted = false;
    };
  });

  return (
    <div
      id="container"
      ref={container}
      className="absolute w-full h-full top-0 left-0"
    ></div>
  );
};
