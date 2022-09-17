import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useHistory } from "react-router-dom";
import { ColyseusStore } from "../store";

export const Room = () => {
  const room = ColyseusStore.getInstance().GetRoom();
  const [clients, setClients] = useState<string[]>([]);
  const history = useHistory();

  useEffect(() => {
    if (room) {
      room.onStateChange.once((state) => {
        //console.log("initial room state:", state);
      });
      room.onStateChange((state) => {
        //console.log(state);
      });
      room.onMessage("messages", (message) => {
        //console.log(message);
      });
      room.onMessage("joined", (clients) => {
        setClients(clients);
      });
      room.onMessage("left", (clients) => {
        setClients(clients);
      });
    }
  }, []);

  const onGameStart = () => {
    history.push("/game");
  };

  return (
    <div className="h-screen flex items-center flex-col mt-10 lg:mt-28">
      <Helmet>
        <title>Room | Police {"&"} Thief</title>
      </Helmet>
      <div className="w-full max-w-screen-sm flex flex-col px-5 items-center">
        <h4 className="title">ROOM</h4>
        <div>
          {clients.map((client) => {
            return <div key={client}>{client}</div>;
          })}
        </div>
        <button className="primary-button" onClick={onGameStart}>
          Game Start
        </button>
      </div>
    </div>
  );
};
