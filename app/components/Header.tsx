import {
  FiMenu,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiChevronRight as FiChevronRightSeparator,
  FiSearch,
  FiShare2,
  FiStar,
  FiList,
} from "react-icons/fi";
import { useLocation, useNavigate, useParams } from "react-router";
import { mainDocuments } from "~/constants/data";

type Props = {};

const Header = (props: Props) => {
  const navigate = useNavigate();
  // Add dynamic logic later
  const { id } = useParams();
  console.log("params", id);
  const mainDocument = mainDocuments.find((doc) => doc.id === id);

  return (
    <div className="w-full border-b border-black/10 h-[50px] px-2 flex items-center justify-between">
      {/* Left side elements */}
      <div className="flex items-center space-x-2">
        <button className="p-2 rounded-md hover:bg-gray-100">
          <FiMenu className="w-5 h-5 text-gray-400" />
        </button>
        <div className="flex items-center space-x-1">
          <button className="p-2 rounded-md hover:bg-gray-100">
            <FiChevronLeft className="w-5 h-5 text-gray-400" />
          </button>
          <button className="p-2 rounded-md hover:bg-gray-100">
            <FiChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <button
          className="p-2 rounded-md hover:bg-gray-100 hover:cursor-pointer"
          onClick={() => navigate("/")}
        >
          <FiHome className="w-5 h-5 text-gray-400" />
        </button>
        {mainDocument && (
          <div className="flex items-center text-gray-400">
            <div key={mainDocument?.id} className="flex items-center">
              <FiChevronRightSeparator className="w-4 h-4" />
              <span className="mx-1.25 text-sm font-medium truncate">
                {mainDocument?.content}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Right side elements */}
      <div className="flex items-center space-x-2">
        <div className="relative">
          <div className="flex items-center bg-gray-100 rounded-md px-3 py-1.5">
            <FiSearch className="w-4 h-4 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search"
              className="bg-transparent border-none outline-none text-sm w-24 placeholder-gray-500"
            />
          </div>
        </div>
        <button className="p-1.5 rounded-md hover:bg-gray-100">
          <FiShare2 className="w-4 h-4 text-gray-600" />
        </button>
        <button className="p-1.5 rounded-md hover:bg-gray-100">
          <FiStar className="w-4 h-4 text-gray-600" />
        </button>
        <button className="p-1.5 rounded-md hover:bg-gray-100">
          <FiList className="w-4 h-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
};

export default Header;
