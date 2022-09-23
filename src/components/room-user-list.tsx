import { IClientInfo, PlayerType, PrepareState } from "../pages/room";
import { faStopwatch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface IRoomUserListProps {
  name: string;
  playTime: number;
  users: IClientInfo[];
}

export const RoomUserList = ({ name, playTime, users }: IRoomUserListProps) => {
  return (
    <div className="w-full ring-1 ring-gray-100 rounded-lg shadow-lg divide-y divide-slate-100">
      <div className="flex flex-row justify-between items-center">
        <div className="py-4 px-6 text-xl font-medium">{name}</div>
        <div className="mr-6">
          <FontAwesomeIcon
            icon={faStopwatch}
            className="text-1xl mr-3 text-gray-500"
          />
          <span className="text-1xl text-gray-500">{playTime}m</span>
        </div>
      </div>

      <ul
        className={`divide-y divide-slate-100 ${
          users.length <= 0 ? "flex justify-center items-center" : null
        }`}
      >
        {users.length <= 0 ? (
          <span className="space-x-6 p-6">noting...</span>
        ) : (
          users.map((user) => {
            return (
              <div
                key={user.sessionId}
                className="flex items-start space-x-6 p-6"
              >
                <img
                  src={
                    user.playerType === PlayerType.POLICE
                      ? "./data/police.png"
                      : "./data/thief.png"
                  }
                  alt="user.name"
                  className="w-6 h-6 rounded-full bg-slate-100 ring-2 ring-gray-200"
                  loading="lazy"
                />
                <div className="min-w-0 relative flex-auto">{`${user.nickname}`}</div>
                <div
                  className={`items-end ${
                    user.prepareState === PrepareState.PREPARE
                      ? "text-red-500"
                      : "text-blue-500"
                  }`}
                >
                  {user.prepareState}
                </div>
              </div>
            );
          })
        )}
      </ul>
    </div>
  );
};
