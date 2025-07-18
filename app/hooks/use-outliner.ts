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
    getNodeById,
    handleNodeUpdate,
    addNodeAfter,
    handleAddChild,
    handleDelete,
    handleEnterKey,
    handleBackspaceKey,
    handleTabKey,
    handleShiftTabKey,
    handleArrowDown,
    handleArrowUp,
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

      handleEnterKey(activeNodeIdRef.current, cursorPosition);
    },
    { enableOnFormTags: ["TEXTAREA"] },
    [handleEnterKey]
  );

  // Handle Tab key - indent (make current node child of previous node)
  useHotkeys(
    "tab",
    (e) => {
      e.preventDefault();
      handleTabKey(activeNodeIdRef.current);
    },
    { enableOnFormTags: ["TEXTAREA"] },
    [handleTabKey, activeNodeIdRef.current]
  );

  // Handle Shift+Tab - unindent (move to parent's level)
  useHotkeys(
    "shift+tab",
    (e) => {
      e.preventDefault();
      handleShiftTabKey(activeNodeIdRef.current);
    },
    { enableOnFormTags: ["TEXTAREA"] },
    [handleShiftTabKey, activeNodeIdRef.current]
  );

  // Handle Backspace key - delete node if empty
  useHotkeys(
    "backspace",
    (e) => {
      if (!activeNodeIdRef.current) return;

      const targetEl = e.target as HTMLTextAreaElement;
      handleBackspaceKey(activeNodeIdRef.current, targetEl.selectionStart);
    },
    { enableOnFormTags: ["TEXTAREA"] },
    [handleBackspaceKey, activeNodeIdRef.current]
  );

  // Handle Up Arrow - navigate to previous node
  useHotkeys(
    "up",
    (e) => {
      e.preventDefault();
      if (!activeNodeIdRef.current) return;
      handleArrowUp(activeNodeIdRef.current);
    },
    { enableOnFormTags: ["TEXTAREA"] },
    [handleArrowUp, activeNodeIdRef.current]
  );

  // Handle Down Arrow - navigate to next node
  useHotkeys(
    "down",
    (e) => {
      e.preventDefault();
      if (!activeNodeIdRef.current) return;
      handleArrowDown(activeNodeIdRef.current);
    },
    { enableOnFormTags: ["TEXTAREA"] },
    [handleArrowDown, activeNodeIdRef.current]
  );

  // Memoize nodeSelected to prevent unnecessary re-calculations
  const nodeSelected = useMemo(() => {
    return nodeId ? getNodeById(nodeId) : null;
  }, [nodeId, getNodeById, nodes]);

  // Scroll to top when component mounts (only once)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return {
    nodes: nodeSelected?.children || nodes,
    nodeTitle: nodeSelected?.content || "",
    addNodeAfter,
    handleAddChild,
    handleDelete,
    handleNodeUpdate,
    handleKeyDown,
  };
};

export default useOutliner;
