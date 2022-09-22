import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { GameMain } from "../../core/game-main";

export const InGame = () => {
  const container = useRef<HTMLDivElement>(null);
  const location = useLocation<{ endPlayTime: number }>();
  const endPlayTime = location.state.endPlayTime;

  useEffect(() => {
    if (container.current && container.current.children.length > 1) return;
    const game = new GameMain(container.current!, endPlayTime);
    game.Init();
  });

  return (
    <>
      <div
        ref={container}
        className="absolute w-full h-full top-0 left-0"
      ></div>
      <div className="absolute w-full top-0 left-0 flex justify-center">
        <div className="w-full max-w-screen-sm bg-transparent flex flex-row justify-between items-center mt-5">
          <div className="flex flex-row items-center">
            <img
              className="w-16 h-16 rounded-full ring-2 ring-blue-500 ring-opacity-50"
              src="./data/police.png"
            />
            <span className="font-bold text-2xl text-fill-white text-stroke-black text-stroke-2">
              4
            </span>
          </div>

          <span>0 : 59</span>
          <div className="flex flex-row items-center">
            <span className="text-gray-500">3</span>
            <img
              className="w-16 h-16 rounded-full ring-2 ring-gray-500 ring-opacity-50"
              src="./data/thief.png"
            />
          </div>
        </div>
      </div>
    </>
  );
};
