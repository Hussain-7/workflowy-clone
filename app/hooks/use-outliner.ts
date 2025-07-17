import { useEffect, useState, useRef, useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import {
  addNodeAfter,
  addNodeBefore,
  findNextNodeInHierarchy,
  findNode,
  findPreviousNode,
  findPreviousNodeInHierarchy,
  focusNodeTextarea,
  generateNodeId,
  handleAddChild,
  handleDelete,
  handleEdit,
  indentNode,
  moveChildrenBetweenNodes,
  moveChildrenToNewParent,
  unIndentNode,
} from "~/lib/outliner-helper";

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

  useEffect(() => {
    setNodes(default_nodes);
  }, [default_nodes]);
  // Initial data structure with a root node
  const [nodes, setNodes] = useState<OutlinerNode[]>(default_nodes);
  const handleEditLocal = useCallback(
    (id: string, content: string) => {
      handleEdit(id, content, nodes, setNodes);
    },
    [nodes, setNodes]
  );

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

      // Get the current node
      const [currentNode, parentNode] = findNode(
        nodes,
        activeNodeIdRef.current
      );
      if (!currentNode) return;

      // Special case: If node is empty, and not at root level, unindent it (same as Shift+Tab)
      if (nodeContent.trim() === "") {
        const status = unIndentNode(activeNodeIdRef, nodes, setNodes);
        if (!status) {
          addNodeAfter(activeNodeIdRef.current, "", nodes, setNodes);
        }
        return;
      }

      // Only proceed to add new nodes if the current node has content

      // Case 1: Cursor at beginning - add node above
      if (cursorPosition === 0) {
        const newNodeId = addNodeBefore(
          activeNodeIdRef.current,
          "",
          nodes,
          setNodes
        );
        if (newNodeId) {
          setTimeout(() => {
            focusNodeTextarea(newNodeId);
          }, 0);
        }
      }
      // Case 2: Cursor at the end - add node after (existing behavior)
      else if (cursorPosition === nodeContent.length) {
        const newNodeId = addNodeAfter(
          activeNodeIdRef.current,
          "",
          nodes,
          setNodes
        );
        if (newNodeId) {
          setTimeout(() => {
            focusNodeTextarea(newNodeId);
          }, 0);
        }
      }
      // Case 3: Cursor in the middle - split content and move children
      else {
        const leftContent = nodeContent.substring(0, cursorPosition);
        const rightContent = nodeContent.substring(cursorPosition);

        // Create a deep copy of the nodes to work with
        const updatedNodes = JSON.parse(
          JSON.stringify(nodes)
        ) as OutlinerNode[];

        // Step 1: Update current node with left content
        const updateNodeContent = (
          nodes: OutlinerNode[],
          id: string,
          content: string
        ): boolean => {
          for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === id) {
              nodes[i].content = content;
              return true;
            }

            if (nodes[i].children.length > 0) {
              const updated = updateNodeContent(nodes[i].children, id, content);
              if (updated) return true;
            }
          }
          return false;
        };

        updateNodeContent(updatedNodes, activeNodeIdRef.current, leftContent);

        // Step 2: Create a new node with right content
        const newNodeId = generateNodeId();
        const newNode: OutlinerNode = {
          id: newNodeId,
          content: rightContent,
          parent_id: currentNode.parent_id,
          children: [],
          meta_data: {
            isEditing: true,
            isExpanded: false,
          },
        };

        // Step 3: Insert new node after current node
        const insertNodeAfter = (
          nodes: OutlinerNode[],
          targetId: string
        ): boolean => {
          for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === targetId) {
              nodes.splice(i + 1, 0, newNode);
              return true;
            }

            if (nodes[i].children.length > 0) {
              const inserted = insertNodeAfter(nodes[i].children, targetId);
              if (inserted) return true;
            }
          }
          return false;
        };

        insertNodeAfter(updatedNodes, activeNodeIdRef.current);

        // Step 4: Move children if needed (using the shared helper function)
        if (currentNode.children.length > 0) {
          // Use the extracted helper function to move children
          moveChildrenBetweenNodes(
            updatedNodes,
            activeNodeIdRef.current,
            newNodeId
          );
        }

        // Apply all changes in one update
        setNodes(updatedNodes);

        // Focus the new node after the DOM update
        setTimeout(() => {
          focusNodeTextarea(newNodeId);
        }, 0);
      }
    },
    { enableOnFormTags: ["TEXTAREA"] },
    [
      addNodeAfter,
      addNodeBefore,
      handleEdit,
      findNode,
      focusNodeTextarea,
      moveChildrenToNewParent,
      unIndentNode,
      activeNodeIdRef,
      nodes,
      setNodes,
    ]
  );

  // Handle Tab key - indent (make current node child of previous node)
  useHotkeys(
    "tab",
    (e) => {
      e.preventDefault();
      indentNode(activeNodeIdRef.current, nodes, setNodes);
    },
    { enableOnFormTags: ["TEXTAREA"] },
    [indentNode, activeNodeIdRef.current, nodes, setNodes]
  );

  // Handle Shift+Tab - unindent (move to parent's level)
  useHotkeys(
    "shift+tab",
    (e) => {
      e.preventDefault();
      unIndentNode(activeNodeIdRef, nodes, setNodes);
    },
    { enableOnFormTags: ["TEXTAREA"] },
    [unIndentNode, activeNodeIdRef, nodes, setNodes]
  );

  // Handle Backspace key - delete node if empty
  useHotkeys(
    "backspace",
    (e) => {
      if (!activeNodeIdRef.current) return;

      const [currentNode] = findNode(nodes, activeNodeIdRef.current);

      // Only delete if node is empty and cursor is at beginning
      const targetEl = e.target as HTMLTextAreaElement;
      if (
        currentNode &&
        currentNode.content === "" &&
        targetEl.selectionStart === 0
      ) {
        e.preventDefault();
        handleDelete(activeNodeIdRef.current, nodes, setNodes);

        // Try to focus on previous node
        const previousNode = findPreviousNode(activeNodeIdRef.current, nodes);
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
          activeNodeIdRef.current,
          nodes
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
        const nextNode = findNextNodeInHierarchy(
          activeNodeIdRef.current,
          nodes
        );

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
  useEffect(() => {
    if (nodes.length === 0) {
      setNodes([
        {
          id: generateNodeId(),
          content: "",
          parent_id: null,
          children: [],
          meta_data: {
            isEditing: true,
            isExpanded: false,
          },
        },
      ]);
    }
  }, [nodes, generateNodeId]);

  return {
    nodes,
    addNodeAfter,
    handleAddChild,
    handleDelete,
    handleEdit: handleEditLocal,
    handleKeyDown,
  };
};

export default useOutliner;
