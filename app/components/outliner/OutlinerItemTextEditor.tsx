import React, { useEffect, useRef } from "react";
import type { OutlinerNode } from "~/hooks/use-outliner";

type Props = {
  node: OutlinerNode;
  handlePaste: (
    e: React.ClipboardEvent<HTMLTextAreaElement>,
    id: string
  ) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>, id: string) => void;
  onNodeUpdate: (id: string, data: Partial<OutlinerNode>) => void;
};

const OutlinerItemTextEditor = ({
  node,
  handlePaste,
  onKeyDown,
  onNodeUpdate,
}: Props) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

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
  return (
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
  );
};

export default OutlinerItemTextEditor;
