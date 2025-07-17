import { useState } from "react";
import { FiSearch } from "react-icons/fi";

type Props = {};

const SearchBar = (props: Props) => {
  const [input, setInput] = useState("");
  return (
    <div className="flex items-center bg-gray-100 rounded-full border border-gray-200 px-1 py-1.5">
      <FiSearch className="w-6 h-4 text-gray-400 mr-2" />
      <input
        id="search-bar"
        name="search-bar"
        type="text"
        placeholder="Search"
        className="bg-transparent border-none outline-none text-sm w-32 md:w-40 text-gray-700 placeholder-gray-600 caret-gray-700"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;
