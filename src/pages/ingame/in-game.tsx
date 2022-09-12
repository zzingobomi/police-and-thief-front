import { useEffect, useRef } from "react";
import { GameMain } from "../../core/game-main";

export const InGame = () => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const game = new GameMain(container.current!);
    game.Init();
  });

  return (
    <div ref={container} className="absolute w-full h-full top-0 left-0"></div>
  );
};
