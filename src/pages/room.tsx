import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useHistory, useLocation } from "react-router-dom";
import { RoomUserList } from "../components/room-user-list";
import { ColyseusStore } from "../store";

export enum PlayerType {
  POLICE = "Police",
  THIEF = "Thief",
}

export enum PrepareState {
  PREPARE = "Prepare",
  READY = "Ready",
}

export interface IClientInfo {
  playerType: string;
  sessionId: string;
  prepareState: PrepareState;
  nickname: string;
}

export const Room = () => {
  const room = ColyseusStore.getInstance().GetRoom();
  const history = useHistory();
  const location = useLocation<{ roomName: string; playTime: number }>();
  const roomName = location.state.roomName;
  const playTime = location.state.playTime;
  const [clients, setClients] = useState<IClientInfo[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (isMounted && room) {
      room.onStateChange.once((state) => {
        //console.log("initial room state:", state);
      });
      room.onStateChange((state) => {
        //console.log(state);
      });
      room.onMessage("messages", (message) => {
        //console.log(message);
      });
      room.onMessage("joined", (clients: IClientInfo[]) => {
        setClients(clients);
      });
      room.onMessage("left", (clients: IClientInfo[]) => {
        setClients(clients);
      });
      room.onMessage("ready.update", (clients: IClientInfo[]) => {
        setClients(clients);
      });
      room.onMessage("game.start", (endPlayTime: number) => {
        onGameStart(endPlayTime);
      });
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const onGameCancelReady = () => {
    room?.send("game.cancel.ready");
    setReady(false);
  };

  const onGameReady = () => {
    room?.send("game.ready");
    setReady(true);
  };

  const onGameLeave = () => {
    room?.leave();
    history.push("/");
  };

  const onGameStart = (endPlayTime: number) => {
    setReady(true);
    history.push({
      pathname: "/game",
      state: { endPlayTime },
    });
  };

  return (
    <div className="h-screen flex items-center flex-col mt-10 lg:mt-28">
      <Helmet>
        <title>Room | Police {"&"} Thief</title>
      </Helmet>
      <div className="w-full max-w-screen-md flex flex-col px-5 items-center">
        <h4 className="title">{roomName} ROOM</h4>
        <div className="w-full max-w-screen-md flex flex-row gap-4 mb-8">
          <RoomUserList
            name="Polices"
            playTime={playTime}
            users={clients.filter(
              (client) => client.playerType === PlayerType.POLICE
            )}
          />
          <RoomUserList
            name="Thiefs"
            playTime={playTime}
            users={clients.filter(
              (client) => client.playerType === PlayerType.THIEF
            )}
          />
        </div>
        <div className="w-full flex flex-row justify-end gap-5">
          <button
            className={` text-white font-bold py-2 px-4 rounded-full ${
              ready
                ? "bg-red-500 hover:bg-red-700"
                : "bg-blue-500 hover:bg-blue-700"
            }`}
            onClick={ready ? onGameCancelReady : onGameReady}
          >
            {ready ? "Cancel Ready" : "Ready"}
          </button>
          <button
            className="text-white font-bold py-2 px-4 rounded-full bg-gray-500 hover:bg-gray-700"
            onClick={onGameLeave}
          >
            Exit
          </button>
        </div>
        <div className="w-full flex flex-col text-gray-400 text-sm items-start mt-10">
          <span>Tip:</span>
          <span>* ????????? ????????? ???????????? ?????? ????????? ????????? ???????????????.</span>
          <span>* ????????? ????????? ??????????????? ??????????????? ???????????????.</span>
          <span>* A, S, W, D ??? ??????, ???????????? ?????? ?????? ?????????.</span>
          <span>* ???????????? ???????????? ???????????? ????????? ????????? ??? ????????????.</span>
          <span>* ????????? F ?????? ?????? ????????? ?????? ??? ????????????.</span>
          <span>* ????????? ???????????? H ?????? ???????????????.</span>
        </div>
      </div>
    </div>
  );
};
