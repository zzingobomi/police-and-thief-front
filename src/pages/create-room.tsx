import React, { useContext } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { Button } from "../components/button";
import { FormError } from "../components/form-error";
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
  const { register, getValues, errors, handleSubmit, formState } =
    useForm<ICreateRoomForm>({
      mode: "onChange",
      defaultValues: {
        maxClient: 8,
      },
    });

  // TODO: 방 이름 조절하기
  const onSubmit = async () => {
    const { roomName, maxClient } = getValues();
    const room = await client?.create(COLYSEUS_ROOM_NAME, {
      roomName,
      maxClient,
    });
    if (room) {
      ColyseusStore.getInstance().SetRoom(room);
      history.push({
        pathname: "/room",
        state: { roomName },
      });
    }
  };

  return (
    <div className="h-screen flex items-center flex-col mt-10 lg:mt-28">
      <Helmet>
        <title>Create Room | Police {"&"} Thief</title>
      </Helmet>
      <div className="w-full max-w-screen-sm flex flex-col px-5 items-center">
        <h4 className="title">CREATE ROOM</h4>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-3 mt-5 px-5 w-full mb-5"
        >
          <input
            ref={register({
              required: "방이름은 필수 입력입니다.",
            })}
            name="roomName"
            required
            placeholder="RoomName"
            className="input"
          />
          {errors.roomName?.message && (
            <FormError errorMessage={errors.roomName?.message} />
          )}
          <input
            ref={register({
              required: "maxClient is required",
              min: 2,
              max: 8,
            })}
            type="number"
            name="maxClient"
            min={2}
            max={8}
            required
            placeholder="Max"
            className="input"
          />
          {errors.maxClient?.message && (
            <FormError errorMessage={errors.maxClient?.message} />
          )}
          <Button
            canClick={formState.isValid}
            loading={false}
            actionText={"Create Room"}
          />
        </form>
      </div>
    </div>
  );
};
