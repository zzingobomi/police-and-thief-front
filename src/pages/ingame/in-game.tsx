import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useInterval } from "react-interval-hook";
import { GameMain } from "../../core/game-main";
import PubSub from "pubsub-js";
import { SignalType } from "../../core/signal-type";
import { PlayerType } from "../room";

export const InGame = () => {
  const container = useRef<HTMLDivElement>(null);
  const location = useLocation<{ endPlayTime: number }>();
  const endPlayTime = location.state.endPlayTime;
  const [policeCount, setPoliceCount] = useState(0);
  const [thiefCount, setThiefCount] = useState(0);
  const [remainTime, setRemainTime] = useState("");

  useInterval(() => {
    const remain = endPlayTime - Date.now();
    setRemainTime(convertMsToTime(remain));
  });

  useEffect(() => {
    if (container.current && container.current.children.length > 1) return;
    const game = new GameMain(container.current!, endPlayTime);
    game.Init();

    PubSub.subscribe(SignalType.CREATE_PLAYER, (msg, data) => {
      const { player } = data;
      if (player.playerType === PlayerType.POLICE) {
        setPoliceCount((prev) => prev + 1);
      } else {
        setThiefCount((prev) => prev + 1);
      }
    });
  });

  return (
    <>
      <div
        ref={container}
        className="absolute w-full h-full top-0 left-0"
      ></div>
      <div className="absolute w-full top-0 left-0 flex justify-center">
        <div className="w-full max-w-screen-md bg-transparent flex flex-row justify-between items-center mt-5">
          <div className="flex flex-row items-center gap-2">
            {[...new Array(policeCount)].map((_, index) => {
              return (
                <img
                  key={index}
                  className="w-14 h-14 rounded-full ring-2 ring-blue-500 ring-opacity-50"
                  src="./data/police.png"
                />
              );
            })}
          </div>
          <span className="font-dsdigi text-6xl text-fill-white text-stroke-black text-stroke-2">
            {remainTime}
          </span>
          <div className="flex flex-row items-center gap-2">
            {[...new Array(thiefCount)].map((_, index) => {
              return (
                <img
                  key={index}
                  className="w-14 h-14 rounded-full ring-2 ring-gray-500 ring-opacity-50"
                  src="./data/thief.png"
                />
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

function padToDigits(num: number, digit: number) {
  return num.toString().padStart(digit, "0");
}
function convertMsToTime(milliseconds: number) {
  let seconds = Math.floor(milliseconds / 1000);
  let minutes = Math.floor(seconds / 60);

  seconds = seconds % 60;
  minutes = minutes % 60;

  if (minutes < 0) minutes = 0;
  if (seconds < 0) seconds = 0;

  return `${padToDigits(minutes, 1)} : ${padToDigits(seconds, 2)}`;
}
