import { useEffect, useState, useRef, useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import useOutlinerStore from "~/store/use-outliner-store";

// Define the structure of an outliner node
export interface OutlinerNode {
  id: string;
  content: string;
  parent_id: string | null;
  children: OutlinerNode[];
  meta_data: {
    isEditing?: boolean;
    isExpanded?: boolean;
  };
}

const useOutliner = (default_nodes: OutlinerNode[]) => {
  // Reference for currently focused node ID
  const activeNodeIdRef = useRef<string | null>(null);

  const {
    nodes,
    setNodes,
    handleEdit,
    generateNodeId,
    findNode,
    unIndentNode,
    addNodeAfter,
    handleAddChild,
    handleDelete,
    indentNode,
    findPreviousNode,
    findPreviousNodeInHierarchy,
    findNextNodeInHierarchy,
    focusNodeTextarea,
    handleEnterKey,
  } = useOutlinerStore();

  // Handle keyboard event to maintain compatibility with component props
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>, nodeId: string) => {
      // Update active node ID on any keyboard event
      activeNodeIdRef.current = nodeId;
    },
    []
  );

  // Handle Enter key - create new item with different behaviors based on cursor position
  useHotkeys(
    "enter",
    (e) => {
      e.preventDefault();
      if (!activeNodeIdRef.current) return;

      const targetEl = e.target as HTMLTextAreaElement;
      const cursorPosition = targetEl.selectionStart;
      const nodeContent = targetEl.value;

      handleEnterKey(activeNodeIdRef.current, cursorPosition, nodeContent);
    },
    { enableOnFormTags: ["TEXTAREA"] },
    [handleEnterKey]
  );

  // Handle Tab key - indent (make current node child of previous node)
  useHotkeys(
    "tab",
    (e) => {
      e.preventDefault();
      indentNode(activeNodeIdRef.current);
    },
    { enableOnFormTags: ["TEXTAREA"] },
    [indentNode, activeNodeIdRef.current]
  );

  // Handle Shift+Tab - unindent (move to parent's level)
  useHotkeys(
    "shift+tab",
    (e) => {
      e.preventDefault();
      unIndentNode(activeNodeIdRef.current);
    },
    { enableOnFormTags: ["TEXTAREA"] },
    [unIndentNode, activeNodeIdRef.current]
  );

  // Handle Backspace key - delete node if empty
  useHotkeys(
    "backspace",
    (e) => {
      if (!activeNodeIdRef.current) return;

      const [currentNode] = findNode(activeNodeIdRef.current);

      // Only delete if node is empty and cursor is at beginning
      const targetEl = e.target as HTMLTextAreaElement;
      if (
        currentNode &&
        currentNode.content === "" &&
        targetEl.selectionStart === 0
      ) {
        e.preventDefault();
        handleDelete(activeNodeIdRef.current);

        // Try to focus on previous node
        const previousNode = findPreviousNode(activeNodeIdRef.current);
        if (previousNode) {
          // Set timeout to allow DOM to update
          setTimeout(() => {
            const previousInput = document.querySelector(
              `[data-node-id="${previousNode.id}"]`
            ) as HTMLTextAreaElement;
            if (previousInput) {
              previousInput.focus();
              previousInput.selectionStart = previousInput.value.length;
              previousInput.selectionEnd = previousInput.value.length;
            }
          }, 0);
        }
      }
    },
    { enableOnFormTags: ["TEXTAREA"] },
    [findNode, findPreviousNode, handleDelete, nodes]
  );

  // Handle Up Arrow - navigate to previous node
  useHotkeys(
    "up",
    (e) => {
      if (!activeNodeIdRef.current) return;
      const targetEl = e.target as HTMLTextAreaElement;

      // Only navigate if cursor is at the beginning of the textarea
      if (targetEl.selectionStart === 0) {
        const previousNode = findPreviousNodeInHierarchy(
          activeNodeIdRef.current
        );

        if (previousNode) {
          e.preventDefault();
          focusNodeTextarea(previousNode.id, "start");
        }
      }
    },
    { enableOnFormTags: ["TEXTAREA"] },
    [findPreviousNodeInHierarchy, focusNodeTextarea, nodes]
  );

  // Handle Down Arrow - navigate to next node
  useHotkeys(
    "down",
    (e) => {
      if (!activeNodeIdRef.current) return;
      const targetEl = e.target as HTMLTextAreaElement;

      // Only navigate if cursor is at the end of the textarea
      if (targetEl.selectionStart === targetEl.value.length) {
        const nextNode = findNextNodeInHierarchy(activeNodeIdRef.current);

        if (nextNode) {
          e.preventDefault();
          focusNodeTextarea(nextNode.id, "start");
        }
      }
    },
    { enableOnFormTags: ["TEXTAREA"] },
    [findNextNodeInHierarchy, focusNodeTextarea, nodes]
  );

  // Start with a single node if there are none
  // useEffect(() => {
  //   if (nodes.length === 0) {
  //     setNodes([
  //       {
  //         id: generateNodeId(),
  //         content: "",
  //         parent_id: null,
  //         children: [],
  //         meta_data: {
  //           isEditing: true,
  //           isExpanded: false,
  //         },
  //       },
  //     ]);
  //   }
  // }, [nodes, generateNodeId]);

  return {
    nodes,
    addNodeAfter,
    handleAddChild,
    handleDelete,
    handleEdit,
    handleKeyDown,
  };
};

export default useOutliner;
