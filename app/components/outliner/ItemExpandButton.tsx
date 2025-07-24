import React from "react";
import { IoTriangleSharp } from "react-icons/io5";
import type { OutlinerNode } from "~/store/use-outliner-store";
import { extractHeadingLevel, MarginForHeading } from "./ItemBullet";

type Props = {
  node: OutlinerNode;
  toggleExpand: (e: React.MouseEvent) => void;
};

const ItemExpandButton = ({ node, toggleExpand }: Props) => {
  const level = extractHeadingLevel(
    node.content
  ) as keyof typeof MarginForHeading;
  const margin = MarginForHeading[level];
  return node.children.length > 0 ? (
    <div
      style={{
        top: margin,
      }}
      className="expand-button absolute left-[-21px] top-[15px] -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:cursor-pointer transition-colors"
      onClick={toggleExpand}
    >
      {node.meta_data.isExpanded ? (
        <IoTriangleSharp className="w-2.25 h-2.25 text-gray-300 rotate-180 hover:text-gray-500" />
      ) : (
        <IoTriangleSharp className="w-2.25 h-2.25 text-gray-300 rotate-90 hover:text-gray-500" />
      )}
    </div>
  ) : null;
};

export default ItemExpandButton;
