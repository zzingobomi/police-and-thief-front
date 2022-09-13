import { useEffect, useState } from "react";
import { ColyseusStore } from "../store";

export const Room = () => {
  const room = ColyseusStore.getInstance().GetRoom();
  const [clients, setClients] = useState<string[]>([]);

  useEffect(() => {
    if (room) {
      room.onStateChange.once((state) => {
        console.log("initial room state:", state);
      });
      room.onStateChange((state) => {
        console.log(state);
      });
      room.onMessage("messages", (message) => {
        console.log(message);
      });
      room.onMessage("joined", (clients) => {
        console.log(clients);
        setClients(clients);
      });
      room.onMessage("left", (clients) => {
        console.log(clients);
        setClients(clients);
      });
    }
  }, []);

  // TODO: Game Start
  const onGameStart = () => {
    console.log("to do game start");
  };

  return (
    <div className="h-screen flex items-center flex-col mt-10 lg:mt-28">
      <div className="w-full max-w-screen-sm flex flex-col px-5 items-center">
        <h4 className="w-full font-medium text-center text-3xl mb-5">Room</h4>
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
