import { useEffect, useState, useRef, useCallback } from "react";
import { useHotkeys } from "react-hotkeys-hook";

// Define the structure of an outliner node
export interface OutlinerNode {
  id: string;
  content: string;
  parent_id: string | null;
  children: OutlinerNode[];
  isEditing?: boolean;
}

const useOutliner = () => {
  // Reference for currently focused node ID
  const activeNodeIdRef = useRef<string | null>(null);

  const generateId = useCallback(
    () => `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    []
  );

  // Initial data structure with a root node
  const [nodes, setNodes] = useState<OutlinerNode[]>([
    {
      id: generateId(),
      content: "",
      parent_id: null,
      children: [],
    },
  ]);

  console.log("Nodes", nodes);

  // Helper function to find a node and its parent in the tree
  const findNode = useCallback(
    (
      nodes: OutlinerNode[],
      id: string
    ): [OutlinerNode | null, OutlinerNode | null, number] => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) {
          return [nodes[i], null, i]; // Found node, no parent (root level), index
        }

        // Look in children
        if (nodes[i].children.length > 0) {
          const [found, parent, index] = findNode(nodes[i].children, id);
          if (found) {
            return [found, parent || nodes[i], index]; // Found node, its parent, index in parent's children
          }
        }
      }

      return [null, null, -1]; // Not found
    },
    []
  );

  // Find previous node in the tree (for backspace handling)
  const findPreviousNode = useCallback(
    (nodeId: string): OutlinerNode | null => {
      let prevNode: OutlinerNode | null = null;

      const traverse = (nodes: OutlinerNode[], targetId: string) => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === targetId) {
            return true;
          }

          // Traverse children
          if (nodes[i].children.length > 0) {
            const found = traverse(nodes[i].children, targetId);
            if (found) {
              return true;
            }
          }

          // This node comes before our target
          prevNode = nodes[i];
        }

        return false;
      };

      traverse(nodes, nodeId);
      return prevNode;
    },
    [nodes]
  );

  // Add a new node at the root level or after a specific node
  const addNodeAfter = useCallback(
    (afterId: string | null = null) => {
      const newNodeId = generateId();
      const newNode: OutlinerNode = {
        id: newNodeId,
        content: "",
        parent_id: null,
        children: [],
        isEditing: true,
      };

      // If afterId is null, add to the root level at the end
      if (afterId === null) {
        setNodes([...nodes, newNode]);
        return;
      }

      // Find the node and its parent to insert after it
      let nodeFound = false;
      let updatedNodes = JSON.parse(JSON.stringify(nodes)) as OutlinerNode[];

      // Helper to insert node after specified id at the same level
      const insertNodeAfter = (
        nodes: OutlinerNode[],
        targetId: string
      ): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === targetId) {
            // Found the node, insert after it at the same level
            newNode.parent_id = nodes[i].parent_id;
            nodes.splice(i + 1, 0, newNode);
            return true;
          }

          // Check children
          if (nodes[i].children.length > 0) {
            const foundInChildren = insertNodeAfter(
              nodes[i].children,
              targetId
            );
            if (foundInChildren) {
              return true;
            }
          }
        }

        return false;
      };

      nodeFound = insertNodeAfter(updatedNodes, afterId);

      if (nodeFound) {
        setNodes(updatedNodes);
      }
    },
    [nodes]
  );

  // Add a child node to a parent node
  const handleAddChild = useCallback(
    (parentId: string) => {
      const newNodeId = generateId();
      const newNode: OutlinerNode = {
        id: newNodeId,
        content: "New child",
        parent_id: parentId,
        children: [],
        isEditing: true,
      };

      // Deep clone the nodes array and add the new child
      const updatedNodes = JSON.parse(JSON.stringify(nodes)) as OutlinerNode[];

      // Helper function to recursively add child to the correct parent
      const addChildToNode = (
        nodes: OutlinerNode[],
        parentId: string,
        newNode: OutlinerNode
      ): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === parentId) {
            nodes[i].children.push(newNode);
            return true;
          }

          if (nodes[i].children.length > 0) {
            const added = addChildToNode(nodes[i].children, parentId, newNode);
            if (added) return true;
          }
        }

        return false;
      };

      addChildToNode(updatedNodes, parentId, newNode);
      setNodes(updatedNodes);
    },
    [nodes]
  );

  // Delete a node and its children
  const handleDelete = useCallback(
    (id: string) => {
      // Helper function to recursively filter out the node and its children
      const filterNodes = (
        nodes: OutlinerNode[],
        id: string
      ): OutlinerNode[] => {
        return nodes.filter((node) => {
          if (node.id === id) return false;

          if (node.children.length > 0) {
            node.children = filterNodes(node.children, id);
          }

          return true;
        });
      };

      const updatedNodes = filterNodes(JSON.parse(JSON.stringify(nodes)), id);
      setNodes(updatedNodes);
    },
    [nodes]
  );

  // Edit a node's content
  const handleEdit = useCallback(
    (id: string, content: string) => {
      // Helper function to recursively update the node's content
      const updateNodeContent = (
        nodes: OutlinerNode[],
        id: string,
        content: string
      ): OutlinerNode[] => {
        return nodes.map((node) => {
          if (node.id === id) {
            return { ...node, content };
          }

          if (node.children.length > 0) {
            return {
              ...node,
              children: updateNodeContent(node.children, id, content),
            };
          }

          return node;
        });
      };

      const updatedNodes = updateNodeContent(
        JSON.parse(JSON.stringify(nodes)),
        id,
        content
      );
      setNodes(updatedNodes);
    },
    [nodes]
  );

  // Toggle edit mode for a node
  const handleToggleEdit = useCallback(
    (id: string) => {
      // Helper function to recursively toggle the node's edit mode
      const toggleNodeEdit = (
        nodes: OutlinerNode[],
        id: string
      ): OutlinerNode[] => {
        return nodes.map((node) => {
          if (node.id === id) {
            return { ...node, isEditing: !node.isEditing };
          }

          if (node.children.length > 0) {
            return { ...node, children: toggleNodeEdit(node.children, id) };
          }

          return node;
        });
      };

      const updatedNodes = toggleNodeEdit(
        JSON.parse(JSON.stringify(nodes)),
        id
      );
      setNodes(updatedNodes);
    },
    [nodes]
  );

  // Remove a node from its parent
  const removeNodeFromParent = useCallback(
    (
      nodes: OutlinerNode[],
      parentId: string | null,
      nodeId: string
    ): OutlinerNode | null => {
      // If it's root level
      if (parentId === null) {
        const index = nodes.findIndex((n) => n.id === nodeId);
        if (index !== -1) {
          return nodes.splice(index, 1)[0];
        }
      } else {
        // Find the parent
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === parentId) {
            const index = nodes[i].children.findIndex((n) => n.id === nodeId);
            if (index !== -1) {
              return nodes[i].children.splice(index, 1)[0];
            }
          }

          if (nodes[i].children.length > 0) {
            const removed = removeNodeFromParent(
              nodes[i].children,
              parentId,
              nodeId
            );
            if (removed) return removed;
          }
        }
      }

      return null;
    },
    []
  );

  // Add a node to a specific parent
  const addNodeToParent = useCallback(
    (
      nodes: OutlinerNode[],
      parentId: string,
      nodeToAdd: OutlinerNode
    ): boolean => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === parentId) {
          nodeToAdd.parent_id = parentId;
          nodes[i].children.push(nodeToAdd);
          return true;
        }

        if (nodes[i].children.length > 0) {
          const added = addNodeToParent(nodes[i].children, parentId, nodeToAdd);
          if (added) return true;
        }
      }

      return false;
    },
    []
  );

  // Find previous sibling's ID
  const getPreviousSiblingId = useCallback(
    (
      nodes: OutlinerNode[],
      parentId: string | null,
      nodeId: string
    ): string | null => {
      if (parentId === null) {
        // Root level
        const index = nodes.findIndex((n) => n.id === nodeId);
        if (index > 0) {
          return nodes[index - 1].id;
        }
      } else {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === parentId) {
            const index = nodes[i].children.findIndex((n) => n.id === nodeId);
            if (index > 0) {
              return nodes[i].children[index - 1].id;
            }
          }

          if (nodes[i].children.length > 0) {
            const found = getPreviousSiblingId(
              nodes[i].children,
              parentId,
              nodeId
            );
            if (found) return found;
          }
        }
      }

      return null;
    },
    []
  );

  // Helper function to add node after a specific parent in the hierarchy
  const addNodeAfterParent = useCallback(
    (
      nodes: OutlinerNode[],
      parentId: string,
      grandParentId: string | null,
      nodeToAdd: OutlinerNode
    ): boolean => {
      if (grandParentId === null) {
        // Parent is at root level
        const parentIndex = nodes.findIndex((n) => n.id === parentId);
        if (parentIndex !== -1) {
          nodeToAdd.parent_id = null;
          nodes.splice(parentIndex + 1, 0, nodeToAdd);
          return true;
        }
        return false;
      }

      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === grandParentId) {
          // Found grandparent, add the node after the parent
          const parentIndex = nodes[i].children.findIndex(
            (n) => n.id === parentId
          );
          if (parentIndex !== -1) {
            nodeToAdd.parent_id = grandParentId;
            nodes[i].children.splice(parentIndex + 1, 0, nodeToAdd);
            return true;
          }
        }

        // Check children
        if (nodes[i].children.length > 0) {
          if (
            addNodeAfterParent(
              nodes[i].children,
              parentId,
              grandParentId,
              nodeToAdd
            )
          ) {
            return true;
          }
        }
      }

      return false;
    },
    []
  );

  // Handle focusing on a node to track active node ID
  const handleFocus = useCallback((nodeId: string) => {
    activeNodeIdRef.current = nodeId;
  }, []);

  // Handle keyboard event to maintain compatibility with component props
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>, nodeId: string) => {
      // Update active node ID on any keyboard event
      activeNodeIdRef.current = nodeId;

      // The actual key handling is done by useHotkeys
    },
    []
  );

  // Handle Enter key - create new item
  useHotkeys(
    "enter",
    (e) => {
      e.preventDefault();
      if (activeNodeIdRef.current) {
        addNodeAfter(activeNodeIdRef.current);
      }
    },
    { enableOnFormTags: ["TEXTAREA"] },
    [addNodeAfter]
  );

  // Handle Tab key - indent (make current node child of previous node)
  useHotkeys(
    "tab",
    (e) => {
      e.preventDefault();
      if (!activeNodeIdRef.current) return;

      const [currentNode, parentNode, indexInParent] = findNode(
        nodes,
        activeNodeIdRef.current
      );
      if (!currentNode) return;
      
      // Cannot indent root level item without siblings or first item in list
      if (indexInParent <= 0) return;
      
      // Make this node a child of previous sibling
      const clonedNodes = JSON.parse(JSON.stringify(nodes)) as OutlinerNode[];

      // Get previous sibling in same parent
      const prevSiblingId = getPreviousSiblingId(
        clonedNodes,
        parentNode?.id || null,
        activeNodeIdRef.current
      );

      if (!prevSiblingId) return;

      // Remove node from its current parent
      const nodeToMove = removeNodeFromParent(
        clonedNodes,
        parentNode?.id || null,
        activeNodeIdRef.current
      );

      // Add as child of previous sibling
      if (nodeToMove) {
        if (addNodeToParent(clonedNodes, prevSiblingId, nodeToMove)) {
          setNodes(clonedNodes);
        }
      }
    },
    { enableOnFormTags: ["TEXTAREA"] },
    [
      findNode,
      getPreviousSiblingId,
      removeNodeFromParent,
      addNodeToParent,
      nodes,
    ]
  );

  // Handle Shift+Tab - unindent (move to parent's level)
  useHotkeys(
    "shift+tab",
    (e) => {
      e.preventDefault();
      if (!activeNodeIdRef.current) return;

      const [currentNode, parentNode, indexInParent] = findNode(
        nodes,
        activeNodeIdRef.current
      );
      if (!currentNode || !parentNode || parentNode.parent_id === null) return;

      const clonedNodes = JSON.parse(JSON.stringify(nodes)) as OutlinerNode[];

      // Remove node from its current parent
      const nodeToMove = removeNodeFromParent(
        clonedNodes,
        parentNode.id,
        activeNodeIdRef.current
      );

      if (nodeToMove) {
        // Add node after parent in grandparent's children
        if (
          addNodeAfterParent(
            clonedNodes,
            parentNode.id,
            parentNode.parent_id,
            nodeToMove
          )
        ) {
          setNodes(clonedNodes);
        }
      }
    },
    { enableOnFormTags: ["TEXTAREA"] },
    [findNode, removeNodeFromParent, addNodeAfterParent, nodes]
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

  // Start with a single node if there are none
  useEffect(() => {
    if (nodes.length === 0) {
      setNodes([
        {
          id: generateId(),
          content: "",
          parent_id: null,
          children: [],
          isEditing: true,
        },
      ]);
    }
  }, [nodes, generateId]);

  return {
    nodes,
    addNodeAfter,
    handleAddChild,
    handleDelete,
    handleEdit,
    handleToggleEdit,
    handleKeyDown,
    handleFocus,
  };
};

export default useOutliner;
