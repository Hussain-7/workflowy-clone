import React, { useState, useRef, useEffect } from "react";
import { FaCircle } from "react-icons/fa";
import { IoTriangleSharp } from "react-icons/io5";
import { useNavigate } from "react-router";
import type { OutlinerNode } from "~/store/use-outliner-store";
import useOutlinerStore from "~/store/use-outliner-store";
import ItemBullet from "./ItemBullet";
import ItemExpandButton from "./ItemExpandButton";

const LEFT_MARGIN = 35;

// OutlinerItem component for recursive rendering
const OutlinerItem: React.FC<{
  node: OutlinerNode;
  onNodeUpdate: (id: string, data: Partial<OutlinerNode>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>, id: string) => void;
  level: number;
  isLastNode: boolean;
  multipleSelected: boolean;
}> = ({ node, onNodeUpdate, onKeyDown, level, multipleSelected }) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { handlePaste, isNodeSelected } = useOutlinerStore();

  // Toggle children visibility
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    onNodeUpdate(node.id, {
      meta_data: { isExpanded: !node.meta_data.isExpanded },
    });
  };

  // Auto-resize textarea based on content
  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto"; // Reset height to recalculate
    textarea.style.height = textarea.scrollHeight + "px";
  };

  // Focus on the input field when in editing mode and resize
  useEffect(() => {
    if (node.meta_data.isEditing && inputRef.current) {
      inputRef.current.focus();
      // Place cursor at the end of text
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
      autoResizeTextarea(inputRef.current);
    }
  }, [node.meta_data.isEditing]);

  // Auto-resize on content change
  useEffect(() => {
    if (inputRef.current) {
      autoResizeTextarea(inputRef.current);
    }
  }, [node.content]);

  // Check if this node is selected
  const selected = isNodeSelected(node.id);
  return (
    <div
      className={`outliner-item relative transition-colors`}
      style={{
        marginLeft: `${level === 0 ? 0 : LEFT_MARGIN}px`,
        position: "relative",
      }}
    >
      {/* Only show connecting line if children are expanded */}
      {node.children.length > 0 && node.meta_data.isExpanded && (
        <div className="absolute left-2.25 top-[30px] w-5 h-[calc(100%-24px)] border-l-2 border-gray-100"></div>
      )}
      {/* Collapse/expand arrow - only shown if node has children */}
      <ItemExpandButton node={node} toggleExpand={toggleExpand} />
      {/* Bullet point */}
      <ItemBullet node={node} />
      <div
        className={`relative pl-6 flex items-center justify-center pt-1.5 ${
          selected && multipleSelected ? "bg-blue-100" : "bg-transparent"
        }`}
      >
        {/* Node content textarea */}
        <textarea
          ref={inputRef}
          value={node.content}
          onChange={(e) => {
            onNodeUpdate(node.id, { content: e.target.value });
            autoResizeTextarea(e.target);
          }}
          onKeyDown={(e) => onKeyDown(e, node.id)}
          onPaste={(e) => handlePaste(e, node.id)}
          onMouseDown={(e) => {
            onKeyDown(
              e as unknown as React.KeyboardEvent<HTMLTextAreaElement>,
              node.id
            );
          }}
          className={`w-full text-black border-none focus:ring-0 outline-none resize-none overflow-hidden block selection:bg-blue-100`}
          autoFocus={node.meta_data.isEditing}
          placeholder="Type here..."
          data-node-id={node.id}
          rows={1}
          style={{
            lineHeight: "24px",
            margin: 0,
            padding: 0,
          }}
        />
      </div>
      {/* Render children recursively only if expanded */}
      {node.children.length > 0 && node.meta_data.isExpanded && (
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
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OutlinerItem;
