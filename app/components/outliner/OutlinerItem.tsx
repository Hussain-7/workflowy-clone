import React, { useRef, useEffect } from "react";
import type { OutlinerNode } from "~/store/use-outliner-store";
import ItemBullet from "./ItemBullet";
import ItemExpandButton from "./ItemExpandButton";
import TiptapEditor from "./TiptapEditor";

const LEFT_MARGIN = 35;

type Props = {
  node: OutlinerNode;
  onNodeUpdate: (id: string, data: Partial<OutlinerNode>) => void;
  onKeyDown: (id: string) => void;
  level: number;
  isLastNode: boolean;
  isNodeSelected: (id: string) => boolean;
  multipleSelected: boolean;
  handlePaste: (
    e: React.ClipboardEvent<HTMLTextAreaElement>,
    id: string
  ) => void;
};

// OutlinerItem component for recursive rendering
const OutlinerItem: React.FC<Props> = ({
  node,
  onNodeUpdate,
  onKeyDown,
  level,
  multipleSelected,
  isNodeSelected,
  handlePaste,
}) => {
  // Toggle children visibility
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeUpdate(node.id, {
      meta_data: { isExpanded: !node.meta_data.isExpanded },
    });
  };

  // Check if this node is selected
  const selected = isNodeSelected(node.id);
  const hasChildren = node.children.length > 0;
  return (
    <div
      className={`outliner-item relative transition-colors`}
      style={{
        marginLeft: `${level === 0 ? 0 : LEFT_MARGIN}px`,
        position: "relative",
      }}
    >
      {/* Connecting lines on left */}
      {hasChildren && (
        <div
          className={`absolute left-2.25 top-[30px] w-5 border-l-2 border-gray-100 transition-all duration-300 ease-in-out ${
            node.meta_data.isExpanded
              ? "h-[calc(100%-30px)] opacity-100"
              : "h-0 opacity-0"
          }`}
        ></div>
      )}
      {/* Collapse/expand arrow - only shown if node has children */}
      <ItemExpandButton node={node} toggleExpand={toggleExpand} />
      {/* Bullet point */}
      <ItemBullet node={node} />

      <div
        className={`relative pl-7 flex items-center justify-center pt-0.75 ${
          selected && multipleSelected ? "bg-blue-100" : "bg-transparent"
        }`}
      >
        {/* Node content textarea */}
        <TiptapEditor
          node={node}
          onNodeUpdate={onNodeUpdate}
          onKeyDown={onKeyDown}
          handlePaste={handlePaste}
        />
      </div>
      {/* Render children recursively only if expanded */}
      {hasChildren && node.meta_data.isExpanded && (
        <div className="children">
          {node.children.map((child, index) => (
            <OutlinerItem
              key={child.id}
              node={child}
              onNodeUpdate={onNodeUpdate}
              onKeyDown={onKeyDown}
              level={level + 1}
              isLastNode={index === node.children.length - 1}
              multipleSelected={multipleSelected}
              isNodeSelected={isNodeSelected}
              handlePaste={handlePaste}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OutlinerItem;
