import { useContext, useEffect, useRef } from "react";
import { colyseusContext } from "../../context";
import { ColyseusStore } from "../../store";
import { World } from "../../ts/world/World";

export const Metaverse = () => {
  const container = useRef<HTMLDivElement>(null);
  const metaworld = useRef<World>();
  const { client } = useContext(colyseusContext);

  useEffect(() => {
    let isMounted = true;
    if (container.current && container.current.children.length > 0) return;
    metaworld.current = new World();
    async function joinMetaverse() {
      const room = await client?.joinOrCreate("meta_room");
      if (room) {
        console.log("join room");
        ColyseusStore.getInstance().SetRoom(room);
      }
    }
    if (isMounted) {
      joinMetaverse();
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
