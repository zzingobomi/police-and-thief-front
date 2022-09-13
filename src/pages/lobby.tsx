import React, { useContext, useEffect, useState } from "react";
import { Link, useHistory } from "react-router-dom";
import { colyseusContext } from "../context";
import { COLYSEUS_LOBBY_ROOM } from "../core/constant";
import * as Colyseus from "colyseus.js";
import { ColyseusStore } from "../store";

interface IRoomInfo {
  allRooms: Colyseus.RoomAvailable[];
}

const roomInfo: IRoomInfo = {
  allRooms: [],
};

export const Lobby = () => {
  const { client } = useContext(colyseusContext);
  const [allRooms, setAllRooms] = useState<Colyseus.RoomAvailable[]>([]);
  const history = useHistory();

  const roomLog = () => {
    for (const room of roomInfo.allRooms) {
      console.log(room.roomId, room.clients, room.maxClients, room.metadata);
    }
  };

  const onJoin = (lobby: Colyseus.Room) => {
    lobby.onMessage("rooms", (rooms) => {
      roomInfo.allRooms = rooms;
      setAllRooms([...roomInfo.allRooms]);
      //roomLog();
    });

    lobby.onMessage("+", ([roomId, room]) => {
      const roomIndex = roomInfo.allRooms.findIndex(
        (room) => room.roomId === roomId
      );
      if (roomIndex !== -1) {
        roomInfo.allRooms[roomIndex] = room;
        setAllRooms([...roomInfo.allRooms]);
      } else {
        roomInfo.allRooms.push(room);
        setAllRooms([...roomInfo.allRooms]);
      }
      //roomLog();
    });

    lobby.onMessage("-", (roomId) => {
      roomInfo.allRooms = roomInfo.allRooms.filter(
        (room) => room.roomId !== roomId
      );
      setAllRooms([...roomInfo.allRooms]);
      //roomLog();
    });

    lobby.onLeave(() => {
      roomInfo.allRooms = [];
      setAllRooms([...roomInfo.allRooms]);
      //roomLog();
    });
  };

  const clickRoomEnter = async (roomId: string) => {
    const room = await client?.joinById(roomId);
    if (room) {
      ColyseusStore.getInstance().SetRoom(room);
      history.push("/room");
    }
  };

  useEffect(() => {
    let isMounted = true;
    async function joinLobby() {
      const lobby = await client?.joinOrCreate(COLYSEUS_LOBBY_ROOM);
      if (lobby) {
        onJoin(lobby);
      }
    }
    if (isMounted) {
      joinLobby();
    }
    return () => {
      isMounted = false;
    };
  }, []);
  return (
    <div className="h-screen flex items-center flex-col mt-10 lg:mt-28">
      <div className="w-full max-w-screen-sm flex flex-col px-5 items-center">
        <h4 className="w-full font-medium text-center text-3xl mb-5">Lobby</h4>
        {allRooms.map((room) => {
          return (
            <div key={room.roomId}>
              name: {room.metadata.roomName} clients: {room.clients} maxClients:{" "}
              {room.maxClients}
              <button
                className="primary-button"
                onClick={() => clickRoomEnter(room.roomId)}
              >
                입장
              </button>
            </div>
          );
        })}
        <Link to="/create-room" className="text-blue-500 hover:underline">
          Go to CreateRoom
        </Link>
      </div>
    </div>
  );
};
