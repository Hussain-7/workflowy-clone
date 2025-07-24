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
    handleShiftTabKey,
    handleArrowDown,
    handleArrowUp,
    selectedNodeIds,
    getSelectedNodes,
    deleteSelectedNodes,
    clearSelection,
  } = useOutlinerStore();

  // Handle keyboard event to maintain compatibility with component props
  const handleKeyDown = useCallback((nodeId: string) => {
    // Update active node ID on any keyboard event
    if (nodeId && activeNodeIdRef.current !== nodeId) {
      activeNodeIdRef.current = nodeId;
    }
  }, []);

  // Handle Shift+Tab - unindent (move to parent's level)
  useHotkeys(
    "shift+tab",
    (e) => {
      e.preventDefault();
      if (!activeNodeIdRef.current) return;
      handleShiftTabKey(activeNodeIdRef.current);
    },
    {
      enableOnContentEditable: true,
      enabled: true,
    },
    [handleShiftTabKey, activeNodeIdRef.current]
  );

  // Handle Up Arrow - navigate to previous node
  useHotkeys(
    "up",
    (e) => {
      e.preventDefault();
      if (!activeNodeIdRef.current) return;
      handleArrowUp(activeNodeIdRef.current);
    },
    {
      enableOnContentEditable: true,
      enabled: true,
    },
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
    {
      enableOnContentEditable: true,
      enabled: true,
    },
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
    multipleSelected: selectedNodeIds.length > 1,
    addNodeAfter,
    handleAddChild,
    handleDelete,
    handleNodeUpdate,
    handleKeyDown,
    getSelectedNodes,
    deleteSelectedNodes,
    clearSelection,
  };
};

export default useOutliner;
