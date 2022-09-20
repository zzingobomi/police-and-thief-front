import * as Colyseus from "colyseus.js";
import { useContext } from "react";
import { useHistory } from "react-router-dom";
import { colyseusContext } from "../context";
import { ColyseusStore } from "../store";
import { faUsers } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useMe } from "../hooks/useMe";

interface IRoomItemProps {
  room: Colyseus.RoomAvailable;
}

export const RoomItem = ({ room }: IRoomItemProps) => {
  const { client } = useContext(colyseusContext);
  const history = useHistory();
  const { data: userData } = useMe();

  const clickRoomEnter = async (roomId: string) => {
    const nickname = userData?.me.nickname;
    const joinRoom = await client?.joinById(roomId, {
      nickname,
    });
    if (joinRoom) {
      ColyseusStore.getInstance().SetRoom(joinRoom);
      history.push({
        pathname: "/room",
        state: { roomName: room.metadata.roomName },
      });
    }
  };

  return (
    <div
      key={room.roomId}
      className="max-w-lg w-full lg:max-w-full flex justify-between items-center bg-white rounded-md 
      hover:bg-indigo-50 hover:shadow-md group ring-1 ring-gray-200 p-5 m-3"
    >
      <div>
        <span className="text-2xl font-medium">{room.metadata.roomName}</span>
      </div>
      <div>
        <FontAwesomeIcon icon={faUsers} className="text-xl mr-3" />
        <span className="text-2xl text-red-500">{room.clients}</span>
        <span className="text-2xl mr-3"> / {room.maxClients}</span>
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
          onClick={() => clickRoomEnter(room.roomId)}
        >
          입장
        </button>
      </div>
    </div>
  );
};
