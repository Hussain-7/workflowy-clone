import React, { useState, useRef, useEffect } from "react";
import { FaCircle } from "react-icons/fa";
import type { OutlinerNode } from "~/hooks/use-outliner";


// OutlinerItem component for recursive rendering
const OutlinerItem: React.FC<{
  node: OutlinerNode;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onToggleEdit: (id: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>, id: string) => void;
  level: number;
  isLastNode: boolean;
}> = ({
  node,
  onAddChild,
  onDelete,
  onEdit,
  onToggleEdit,
  onKeyDown,
  level,
  isLastNode,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto"; // Reset height to recalculate
    textarea.style.height = textarea.scrollHeight + "px";
  };

  // Focus on the input field when in editing mode and resize
  useEffect(() => {
    if (node.isEditing && inputRef.current) {
      inputRef.current.focus();
      // Place cursor at the end of text
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
      autoResizeTextarea(inputRef.current);
    }
  }, [node.isEditing]);

  // Auto-resize on content change
  useEffect(() => {
    if (inputRef.current) {
      autoResizeTextarea(inputRef.current);
    }
  }, [node.content]);

  return (
    <div className="outliner-item" style={{ marginLeft: `${level * 20}px` }}>
      <div className="relative pl-6 flex items-center justify-center mt-1">
        {/* Bullet point */}
        <div className="absolute left-0 top-3 -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-200 hover:cursor-pointer rounded-full transition-colors">
          <FaCircle className="w-2 h-2 aspect-square text-gray-700" />
        </div>
        {/* Borderless, transparent input field with text wrapping */}
        <textarea
          ref={inputRef}
          value={node.content}
          onChange={(e) => {
            onEdit(node.id, e.target.value);
            autoResizeTextarea(e.target);
          }}
          onKeyDown={(e) => onKeyDown(e, node.id)}
          className="w-full text-black border-none focus:ring-0 outline-none bg-transparent resize-none overflow-hidden block"
          autoFocus={node.isEditing}
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
      {/* Render children recursively */}
      {node.children.length > 0 && (
        <div className="children">
          {node.children.map((child, index) => (
            <OutlinerItem
              key={child.id}
              node={child}
              onAddChild={onAddChild}
              onDelete={onDelete}
              onEdit={onEdit}
              onToggleEdit={onToggleEdit}
              onKeyDown={onKeyDown}
              level={level + 1}
              isLastNode={index === node.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OutlinerItem;