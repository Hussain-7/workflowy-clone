import { useEffect, useState, useRef, useCallback, useMemo } from "react";
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

const useOutliner = (nodeId?: string) => {
  // Reference for currently focused node ID
  const activeNodeIdRef = useRef<string | null>(null);

  const {
    nodes,
    isLoading,
    getNodeById,
    handleEdit,
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
        const previousNode = findPreviousNodeInHierarchy(activeNodeIdRef.current);
        handleDelete(activeNodeIdRef.current);
        // Try to focus on previous node
        console.log("previousNode", previousNode);
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
    [
      findNode,
      findPreviousNodeInHierarchy,
      handleDelete,
      activeNodeIdRef.current,
    ]
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
    [findPreviousNodeInHierarchy, focusNodeTextarea]
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
    [findNextNodeInHierarchy, focusNodeTextarea]
  );

  // Memoize nodeSelected to prevent unnecessary re-calculations
  const nodeSelected = useMemo(() => {
    return nodeId ? getNodeById(nodeId) : null;
  }, [nodeId, getNodeById]);

  // Scroll to top when component mounts (only once)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Track if we've already auto-added nodes to prevent duplicates
  const didAutoAddRef = useRef(false);

  // Auto-add child to selected node if it has no children
  useEffect(() => {
    if (isLoading || !nodeSelected || didAutoAddRef.current) return;

    if (nodeSelected.children.length === 0) {
      didAutoAddRef.current = true;
      handleAddChild(nodeSelected.id);
    }
  }, [nodeSelected, handleAddChild, isLoading]);

  // Auto-add root node if no nodes exist and we're on root page
  useEffect(() => {
    if (isLoading || nodeId || didAutoAddRef.current || nodes.length > 0)
      return;

    didAutoAddRef.current = true;
    handleAddChild(null);
  }, [isLoading, nodeId, nodes.length, handleAddChild]);

  // Reset auto-add flag when nodeId changes
  useEffect(() => {
    didAutoAddRef.current = false;
  }, [nodeId]);

  return {
    nodes: nodeSelected?.children || nodes,
    nodeTitle: nodeSelected?.content || "",
    addNodeAfter,
    handleAddChild,
    handleDelete,
    handleEdit,
    handleKeyDown,
  };
};

export default useOutliner;
