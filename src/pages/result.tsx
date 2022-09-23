import { Link, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";

export const Result = () => {
  const location = useLocation<{ victoryTeam: string }>();
  const victoryTeam = location.state.victoryTeam;

  return (
    <div className="h-screen flex items-center flex-col mt-10 lg:mt-28">
      <Helmet>
        <title>Result | Police {"&"} Thief</title>
      </Helmet>
      <div className="w-full max-w-screen-md flex flex-col px-5 items-center">
        <h4 className="title">{victoryTeam} VICTORY!!</h4>
        <Link to="/" className="text-blue-500 hover:underline mt-8">
          Go to Lobby →
        </Link>
      </div>
    </div>
  );
};
