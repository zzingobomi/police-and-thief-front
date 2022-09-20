import React, { useContext, useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { colyseusContext } from "../context";
import { COLYSEUS_LOBBY_ROOM } from "../core/constant";
import * as Colyseus from "colyseus.js";
import { RoomItem } from "../components/room-item";

interface IRoomInfo {
  allRooms: Colyseus.RoomAvailable[];
}

const roomInfo: IRoomInfo = {
  allRooms: [],
};

export const Lobby = () => {
  const { client } = useContext(colyseusContext);
  const [allRooms, setAllRooms] = useState<Colyseus.RoomAvailable[]>([]);

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
      <Helmet>
        <title>Lobby | Police {"&"} Thief</title>
      </Helmet>
      <div className="w-full max-w-screen-sm flex flex-col px-5 items-center">
        <h4 className="title">LOBBY</h4>
        {allRooms.length <= 0 ? (
          <img className="w-80" src="./data/empty.png" />
        ) : (
          allRooms.map((room) => {
            return <RoomItem key={room.roomId} room={room} />;
          })
        )}
        <Link to="/create-room" className="text-blue-500 hover:underline mt-8">
          Go to CreateRoom →
        </Link>
      </div>
    </div>
  );
};
