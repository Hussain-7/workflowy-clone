import {
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiChevronRight as FiChevronRightSeparator,
  FiShare2,
} from "react-icons/fi";
import { useNavigate, useParams } from "react-router";
import type { OutlinerNode } from "@/hooks/use-outliner";
import SearchBar from "./SearchBar";
import useOutlinerStore from "~/store/use-outliner-store";

type Props = {};

const Header = (props: Props) => {
  const navigate = useNavigate();
  // Add dynamic logic later
  const { id } = useParams();
  const { findNode } = useOutlinerStore();
  const [nodeSelected, parent, index] = findNode(id || null);
  return (
    <div className="w-full border-b border-black/10 h-[50px] px-2 flex items-center justify-between">
      {/* Left side elements */}
      <div className="flex items-center space-x-0 md:space-x-2">
        <button className="p-1 md:p-2 rounded-md hover:bg-gray-100">
          <FiMenu className="w-5 h-5 text-gray-400" />
        </button>
        <div className="flex items-center space-x-1">
          <button
            className="p-1 md:p-2 rounded-md hover:bg-gray-100 hover:cursor-pointer"
            onClick={() => {
              navigate(-1);
            }}
          >
            <FiChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <button
            className="p-1 md:p-2 rounded-md hover:bg-gray-100 hover:cursor-pointer"
            onClick={() => {
              navigate(1);
            }}
          >
            <FiChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <button
          className="p-1 md:p-2 rounded-md hover:bg-gray-100 hover:cursor-pointer"
          onClick={() => navigate("/")}
        >
          <FiHome className="w-5 h-5 text-gray-400" />
        </button>
        {nodeSelected && (
          <div className="flex items-center text-gray-400">
            <div key={nodeSelected?.id} className="flex items-center">
              <FiChevronRightSeparator className="w-4 h-4" />
              <span
                className="mx-1.25 text-sm font-medium truncate"
                dangerouslySetInnerHTML={{ __html: nodeSelected?.content }}
              ></span>
            </div>
          </div>
        )}
      </div>

      {/* Right side elements */}
      <div className="flex items-center space-x-1 md:space-x-2">
        <SearchBar />
        <button className="p-1.5 rounded-md hover:bg-gray-100">
          <FiShare2 className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default Header;
