import React from "react";

interface IButtonProps {
  canClick: boolean;
  loading: boolean;
  actionText: string;
}

export const Button: React.FC<IButtonProps> = ({
  canClick,
  loading,
  actionText,
}) => (
  <button
    className={`primary-button ${
      canClick
        ? "bg-blue-500 hover:bg-blue-700"
        : "bg-gray-500 pointer-events-none"
    }`}
  >
    {loading ? "Loading..." : actionText}
  </button>
);
