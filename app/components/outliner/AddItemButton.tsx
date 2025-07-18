import React from "react";
import { FiPlus } from "react-icons/fi";

type Props = {
  handleAddChild: () => void;
};

const AddItemButton = ({ handleAddChild }: Props) => {
  return (
    <div onClick={handleAddChild}>
      <FiPlus className="mt-2 w-5 h-5 text-xs! font-thin! text-gray-400 hover:cursor-pointer hover:bg-gray-100 rounded-full" />
    </div>
  );
};

export default AddItemButton;
