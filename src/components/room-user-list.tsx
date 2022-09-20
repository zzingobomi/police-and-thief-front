import { IClientInfo, PlayerType, PrepareState } from "../pages/room";

interface IRoomUserListProps {
  name: string;
  users: IClientInfo[];
}

// TODO: Ready State
export const RoomUserList = ({ name, users }: IRoomUserListProps) => {
  return (
    <div className="w-full ring-1 ring-gray-100 rounded-lg shadow-lg divide-y divide-slate-100">
      <div className="py-4 px-6 text-xl font-medium">{name}</div>

      <ul className="divide-y divide-slate-100">
        {users.map((user) => {
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
              <div className="min-w-0 relative flex-auto">{`${user.sessionId}`}</div>
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
        })}
      </ul>
    </div>
  );
};
