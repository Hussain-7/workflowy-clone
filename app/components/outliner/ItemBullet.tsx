import { FaCircle } from "react-icons/fa";
import { useNavigate } from "react-router";
import type { OutlinerNode } from "~/store/use-outliner-store";

type Props = {
  node: OutlinerNode;
};

export const MarginForHeading = {
  0: "15px",
  1: "36px",
  2: "32px",
  3: "30px",
};

export const extractHeadingLevel = (content: string) => {
  const match = content.match(/<h([1-6])>/);
  return match ? Number(match[1]) : 0;
};

const ItemBullet = ({ node }: Props) => {
  const navigate = useNavigate();
  const level = extractHeadingLevel(
    node.content
  ) as keyof typeof MarginForHeading;
  const margin = MarginForHeading[level];
  return (
    <div
      style={{
        top: margin,
      }}
      onClick={() => {
        navigate(`/doc/${node.id}`);
      }}
      className={`z-5! absolute left-0.5 cursor-pointer -translate-y-1/2 w-5 h-5 flex items-center justify-center ${
        node.children.length > 0 && !node.meta_data.isExpanded
          ? "bg-gray-200 hover:cursor-pointer"
          : "hover:bg-gray-200"
      } rounded-full transition-colors`}
    >
      <FaCircle className="w-2 h-2 aspect-square text-gray-700" />
    </div>
  );
};

export default ItemBullet;
