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

  // Handle paste events for structured text
  // const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
  //   const pastedText = e.clipboardData.getData("text");
  //   console.log("pastedText", pastedText);

  //   // Check if the pasted text contains multiple lines
  //   const lines = pastedText.split("\n").filter((line) => line.trim() !== "");
  //   console.log("lines", lines);
  //   console.log("lines.length", lines.length);

  //   // Check if it's structured content (bullets, numbers, indentation)
  //   const hasStructuredContent =
  //     lines.length > 1 &&
  //     lines.some((line) => {
  //       const hasBullet = line.match(/^\s*[-*+]\s/);
  //       const hasNumber = line.match(/^\s*\d+\.\s/);
  //       const hasIndent = line.match(/^\s{2,}/);
  //       console.log(
  //         `Line: "${line}" | Bullet: ${!!hasBullet} | Number: ${!!hasNumber} | Indent: ${!!hasIndent}`
  //       );
  //       return hasBullet || hasNumber || hasIndent;
  //     });

  //   // Check if it's simple multi-line text (no structure but multiple lines)
  //   const isMultiLineText = lines.length > 1 && !hasStructuredContent;

  //   console.log("hasStructuredContent", hasStructuredContent);
  //   console.log("isMultiLineText", isMultiLineText);

  //   if (hasStructuredContent) {
  //     e.preventDefault();
  //     console.log(
  //       "Preventing default and calling parseAndInsertStructuredText for structured content"
  //     );

  //     // Clear current node content if it's empty, then insert all structured content
  //     if (node.content.trim() === "") {
  //       onNodeUpdate(node.id, { content: "" });
  //       // Insert all content as siblings after the current empty node
  //       parseAndInsertStructuredText(pastedText, node.id, true, false);
  //     } else {
  //       // Insert all content as siblings after the current node
  //       parseAndInsertStructuredText(pastedText, node.id, true, false);
  //     }
  //   } else if (isMultiLineText) {
  //     e.preventDefault();
  //     console.log(
  //       "Preventing default and creating separate nodes for multi-line text"
  //     );

  //     // Update current node with first line
  //     onNodeUpdate(node.id, { content: lines[0] });

  //     // Create separate nodes for remaining lines
  //     const remainingLines = lines.slice(1);
  //     let currentNodeId = node.id;

  //     for (const line of remainingLines) {
  //       // Add each line as a new sibling node after the current one
  //       const newNodeId = addNodeAfter(currentNodeId, line);
  //       if (newNodeId) {
  //         currentNodeId = newNodeId;
  //       }
  //     }
  //   } else {
  //     console.log("Single line or normal paste, allowing default behavior");
  //   }
  // };

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
        <div className="absolute left-2.25 top-[30px] w-5 h-[calc(100%-24px)] border-l-2 border-gray-200"></div>
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
