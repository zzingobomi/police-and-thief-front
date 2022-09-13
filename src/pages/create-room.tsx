import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { colyseusContext } from "../context";
import { COLYSEUS_ROOM_NAME } from "../core/constant";
import { ColyseusStore } from "../store";

interface ICreateRoomForm {
  roomName: string;
  maxClient: number;
}

export const CreateRoom = () => {
  const { client } = useContext(colyseusContext);
  const history = useHistory();
  const { register, getValues, errors, handleSubmit } =
    useForm<ICreateRoomForm>({
      mode: "onChange",
      defaultValues: {
        maxClient: 8,
      },
    });

  // TODO: 방 이름 조절하기
  const onSubmit = async () => {
    const { roomName, maxClient } = getValues();
    console.log(roomName, maxClient);
    const room = await client?.create(COLYSEUS_ROOM_NAME, {
      roomName,
      maxClient,
    });
    if (room) {
      ColyseusStore.getInstance().SetRoom(room);
      history.push("/room");
    }
  };

  return (
    <div className="h-screen flex items-center flex-col mt-10 lg:mt-28">
      <div className="w-full max-w-screen-sm flex flex-col px-5 items-center">
        <h4 className="w-full font-medium text-center text-3xl mb-5">
          Create Room
        </h4>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-3 mt-5 px-5 w-full mb-5"
        >
          <input
            ref={register({
              required: "Name is required",
            })}
            name="roomName"
            required
            placeholder="RoomName"
            className="input"
          />
          <input
            ref={register({
              required: "maxClient is required",
            })}
            type="number"
            name="maxClient"
            required
            placeholder="Max"
            className="input"
          />
          <button className="primary-button">Create Room</button>
        </form>
      </div>
    </div>
  );
};