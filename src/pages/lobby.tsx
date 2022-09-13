import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { colyseusContext } from "../context";
import { COLYSEUS_LOBBY_ROOM } from "../core/constant";
import * as Colyseus from "colyseus.js";

// TODO: room 더하고 빼는 로직 수정해야함
export const Lobby = () => {
  const { client } = useContext(colyseusContext);
  const [allRooms, setAllRooms] = useState<any[]>([]);

  const onJoin = (lobby: Colyseus.Room) => {
    lobby.onMessage("rooms", (rooms) => {
      console.log("Received full list of rooms:", rooms);
      setAllRooms(rooms);
    });

    lobby.onMessage("+", ([roomId, room]) => {
      const roomIndex = allRooms.findIndex((room) => room.roomId === roomId);
      if (roomIndex !== -1) {
        console.log("Room update:", room);
        // setAllRooms((allRooms) => {
        //   const roomCopy = [...allRooms];
        //   roomCopy.splice(roomIndex, 1);
        //   roomCopy.splice(roomIndex, 0, room);
        //   return [...roomCopy];
        // });
      } else {
        console.log("New room", room);
        // setAllRooms([...allRooms, room]);
      }
    });

    lobby.onMessage("-", (roomId) => {
      console.log("Room removed", roomId);
      // setAllRooms((allRooms) => {
      //   return [...allRooms.filter((room) => room.roomId !== roomId)];
      // });
    });

    lobby.onLeave(() => {
      setAllRooms([]);
      console.log("Bye, bye!");
    });
  };

  useEffect(() => {
    async function joinLobby() {
      const lobby = await client?.joinOrCreate(COLYSEUS_LOBBY_ROOM);
      if (lobby) {
        onJoin(lobby);
      }
    }
    joinLobby();
  }, []);
  return (
    <div className="h-screen flex items-center flex-col mt-10 lg:mt-28">
      <div className="w-full max-w-screen-sm flex flex-col px-5 items-center">
        <h4 className="w-full font-medium text-center text-3xl mb-5">Lobby</h4>
        <div>{allRooms.length}</div>
        {allRooms.map((room) => {
          return <div key={room.roomId}>{room.roomId}</div>;
        })}
        <Link to="/create-room" className="text-blue-500 hover:underline">
          Go to CreateRoom
        </Link>
      </div>
    </div>
  );
};
