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

const ROOT_ID = "node_sahfkashfksahfkshakfhsafhksahfk";

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
      id: ROOT_ID,
      content: "",
      parent_id: null,
      children: [],
    },
  ]);

  console.log("Nodes", JSON.stringify(nodes));

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

  // Get all nodes in flattened order for up/down navigation
  const getAllNodesFlattened = useCallback(() => {
    const flattenedNodes: OutlinerNode[] = [];

    const traverseInOrder = (nodes: OutlinerNode[]) => {
      for (let i = 0; i < nodes.length; i++) {
        flattenedNodes.push(nodes[i]);
        if (nodes[i].children.length > 0) {
          traverseInOrder(nodes[i].children);
        }
      }
    };

    traverseInOrder(nodes);
    return flattenedNodes;
  }, [nodes]);

  // Find the deepest last child of a node
  const findDeepestLastChild = useCallback(
    (node: OutlinerNode): OutlinerNode => {
      if (node.children.length === 0) {
        return node;
      }

      // Get last child
      const lastChild = node.children[node.children.length - 1];

      // Recursively find the deepest last child
      return findDeepestLastChild(lastChild);
    },
    []
  );

  // Find the previous node in hierarchy for up arrow navigation
  const findPreviousNodeInHierarchy = useCallback(
    (nodeId: string): OutlinerNode | null => {
      const flattenedNodes = getAllNodesFlattened();
      const currentIndex = flattenedNodes.findIndex((n) => n.id === nodeId);

      if (currentIndex === -1 || currentIndex <= 0) {
        return null; // No previous node
      }

      return flattenedNodes[currentIndex - 1];
    },
    [getAllNodesFlattened]
  );

  // Find the next node in hierarchy for down arrow navigation
  const findNextNodeInHierarchy = useCallback(
    (nodeId: string): OutlinerNode | null => {
      const flattenedNodes = getAllNodesFlattened();
      const currentIndex = flattenedNodes.findIndex((n) => n.id === nodeId);

      if (currentIndex === -1 || currentIndex >= flattenedNodes.length - 1) {
        return null; // No next node
      }

      return flattenedNodes[currentIndex + 1];
    },
    [getAllNodesFlattened]
  );

  // Focus a specific node's textarea
  const focusNodeTextarea = useCallback(
    (nodeId: string, cursorPosition: "start" | "end" = "end") => {
      setTimeout(() => {
        const textarea = document.querySelector(
          `[data-node-id="${nodeId}"]`
        ) as HTMLTextAreaElement;

        if (textarea) {
          textarea.focus();
          if (cursorPosition === "start") {
            textarea.selectionStart = 0;
            textarea.selectionEnd = 0;
          } else {
            textarea.selectionStart = textarea.value.length;
            textarea.selectionEnd = textarea.value.length;
          }
        }
      }, 0);
    },
    []
  );

  // Add a new node at the root level or after a specific node
  const addNodeAfter = useCallback(
    (afterId: string | null = null, content: string = "") => {
      const newNodeId = generateId();
      const newNode: OutlinerNode = {
        id: newNodeId,
        content: content,
        parent_id: null,
        children: [],
        isEditing: true,
      };

      // If afterId is null, add to the root level at the end
      if (afterId === null) {
        setNodes([...nodes, newNode]);
        return newNodeId;
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
        return newNodeId;
      }

      return null;
    },
    [nodes, generateId]
  );

  // Add a new node before a specific node
  const addNodeBefore = useCallback(
    (beforeId: string, content: string = "") => {
      const newNodeId = generateId();
      const newNode: OutlinerNode = {
        id: newNodeId,
        content: content,
        parent_id: null,
        children: [],
        isEditing: true,
      };

      // Find the node to insert before
      const updatedNodes = JSON.parse(JSON.stringify(nodes)) as OutlinerNode[];
      let nodeFound = false;

      // Helper to insert node before specified id at the same level
      const insertNodeBefore = (
        nodes: OutlinerNode[],
        targetId: string
      ): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === targetId) {
            // Found the node, insert before it at the same level
            newNode.parent_id = nodes[i].parent_id;
            nodes.splice(i, 0, newNode);
            return true;
          }

          // Check children
          if (nodes[i].children.length > 0) {
            const foundInChildren = insertNodeBefore(
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

      nodeFound = insertNodeBefore(updatedNodes, beforeId);

      if (nodeFound) {
        setNodes(updatedNodes);
        return newNodeId;
      }

      return null;
    },
    [nodes, generateId]
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
      console.log("removeNodeFromParent - parentId:", parentId, "nodeId:", nodeId);
      // If it's root level
      if (parentId === null) {
        const index = nodes.findIndex((n) => n.id === nodeId);
        console.log("Root level removal, index:", index);
        if (index !== -1) {
          const removed = nodes.splice(index, 1)[0];
          console.log("Removed from root:", removed);
          return removed;
        }
      } else {
        // Find the parent
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === parentId) {
            const index = nodes[i].children.findIndex((n) => n.id === nodeId);
            console.log("Found parent, child index:", index);
            if (index !== -1) {
              const removed = nodes[i].children.splice(index, 1)[0];
              console.log("Removed from parent:", removed);
              return removed;
            }
          }

          if (nodes[i].children.length > 0) {
            const removed = removeNodeFromParent(
              nodes[i].children,
              parentId,
              nodeId
            );
            if (removed) {
              console.log("Removed from nested children:", removed);
              return removed;
            }
          }
        }
      }

      console.log("Failed to remove node");
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
      console.log("addNodeAfterParent - parentId:", parentId);
      console.log("grandParentId:", grandParentId);
      console.log("nodeToAdd:", nodeToAdd);
      
      if (grandParentId === null) {
        // Parent is at root level
        const parentIndex = nodes.findIndex((n) => n.id === parentId);
        console.log("Parent is at root level, index:", parentIndex);
        
        if (parentIndex !== -1) {
          // Set correct parent_id for the node to add
          nodeToAdd.parent_id = null;
          // Add node after parent at root level
          nodes.splice(parentIndex + 1, 0, nodeToAdd);
          console.log("Added at root level after parent");
          return true;
        }
        return false;
      }

      // Find the grandparent at root level first
      const rootGrandparent = nodes.find((n) => n.id === grandParentId);
      if (rootGrandparent) {
        // Found grandparent at root level
        const parentIndex = rootGrandparent.children.findIndex((n) => n.id === parentId);
        console.log("Found grandparent at root, parent index:", parentIndex);
        
        if (parentIndex !== -1) {
          // Set correct parent_id for the node to add
          nodeToAdd.parent_id = grandParentId;
          // Add node after parent in grandparent's children
          rootGrandparent.children.splice(parentIndex + 1, 0, nodeToAdd);
          console.log("Added after parent in root grandparent's children");
          return true;
        }
      }

      // Search deeper in the tree
      for (let i = 0; i < nodes.length; i++) {
        // Check if this node is the grandparent
        if (nodes[i].id === grandParentId) {
          // Found grandparent, add the node after the parent
          const parentIndex = nodes[i].children.findIndex((n) => n.id === parentId);
          console.log("Found grandparent in tree, parent index:", parentIndex);
          
          if (parentIndex !== -1) {
            // Set correct parent_id for the node to add
            nodeToAdd.parent_id = grandParentId;
            // Add node after parent in grandparent's children
            nodes[i].children.splice(parentIndex + 1, 0, nodeToAdd);
            console.log("Added after parent in grandparent's children");
            return true;
          }
        }

        // Check children recursively
        if (nodes[i].children.length > 0) {
          if (
            addNodeAfterParent(
              nodes[i].children,
              parentId,
              grandParentId,
              nodeToAdd
            )
          ) {
            console.log("Added in nested children");
            return true;
          }
        }
      }

      console.log("Failed to add node after parent");
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

  // Helper function to move children to a new parent node
  const moveChildrenToNewParent = useCallback(
    (sourceId: string, targetId: string) => {
      const updatedNodes = JSON.parse(JSON.stringify(nodes)) as OutlinerNode[];

      // Find the source node to get its children
      const findSourceNode = (nodes: OutlinerNode[]): OutlinerNode | null => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === sourceId) {
            return nodes[i];
          }

          if (nodes[i].children.length > 0) {
            const foundInChildren = findSourceNode(nodes[i].children);
            if (foundInChildren) return foundInChildren;
          }
        }

        return null;
      };

      // Find the target node to move children to
      const moveChildrenTo = (
        nodes: OutlinerNode[],
        children: OutlinerNode[]
      ): boolean => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].id === targetId) {
            // Move all children to the target node
            nodes[i].children = [...children];
            // Update parent_id of all moved children
            for (let child of nodes[i].children) {
              child.parent_id = targetId;
            }
            return true;
          }

          if (nodes[i].children.length > 0) {
            const movedToChild = moveChildrenTo(nodes[i].children, children);
            if (movedToChild) return true;
          }
        }

        return false;
      };

      const sourceNode = findSourceNode(updatedNodes);

      if (sourceNode && sourceNode.children.length > 0) {
        const childrenToMove = [...sourceNode.children];
        // Clear children from source node
        sourceNode.children = [];

        if (moveChildrenTo(updatedNodes, childrenToMove)) {
          setNodes(updatedNodes);
          return true;
        }
      }

      return false;
    },
    [nodes]
  );

  // Helper function to unindent a node (move to parent's level)
  const unindentNode = useCallback(
    (nodeId: string): boolean => {
      console.log("Attempting to unindent node:", nodeId);
      const [currentNode, parentNode, indexInParent] = findNode(nodes, nodeId);
      console.log("Current node:", currentNode);
      console.log("Parent node:", parentNode);
      
      // Can't unindent if no parent or at root level already
      if (!currentNode || !parentNode || parentNode.parent_id === null) {
        console.log("Cannot unindent: no parent or at root level");
        return false;
      }
      
      console.log("Parent node's parent ID:", parentNode.parent_id);
      
      // Create a deep copy to avoid mutation issues
      const clonedNodes = JSON.parse(JSON.stringify(nodes)) as OutlinerNode[];
      
      // Remove node from its current parent
      const nodeToMove = removeNodeFromParent(
        clonedNodes,
        parentNode.id,
        nodeId
      );
      console.log("Node to move:", nodeToMove);
      
      if (nodeToMove) {
        // Add node after parent in grandparent's children
        const success = addNodeAfterParent(
          clonedNodes,
          parentNode.id,
          parentNode.parent_id,
          nodeToMove
        );
        
        console.log("Add node after parent success:", success);
        
        if (success) {
          console.log("Setting new nodes structure");
          setNodes(clonedNodes);
          return true;
        }
      }
      
      console.log("Unindent failed");
      return false;
    },
    [nodes, findNode, removeNodeFromParent, addNodeAfterParent]
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
      const [currentNode, parentNode] = findNode(nodes, activeNodeIdRef.current);
      if (!currentNode) return;

      // Special case: If node is empty, and not at root level, unindent it (same as Shift+Tab)
      if (nodeContent.trim() === "") {
        console.log("Enter pressed on empty node:", activeNodeIdRef.current);
        // Check if node is at root level (has no parent or parent_id is null)
        const isRootLevel = !parentNode || parentNode.parent_id === null;
        console.log("Is root level node:", isRootLevel);
        
        if (!isRootLevel) {
          // If not at root level, unindent instead of creating a new node
          console.log("Attempting to unindent on Enter key");
          
          // Create a copy of the node tree to avoid mutation issues
          const clonedNodes = JSON.parse(JSON.stringify(nodes)) as OutlinerNode[];
          
          // Find the current node and its parent in the cloned tree
          const [clonedNode, clonedParent, indexInParent] = findNode(
            clonedNodes, 
            activeNodeIdRef.current
          );
          
          if (clonedNode && clonedParent && clonedParent.parent_id !== null) {
            console.log("Found node and parent in cloned tree");
            
            // Remove node from its current parent
            const nodeToMove = removeNodeFromParent(
              clonedNodes,
              clonedParent.id,
              activeNodeIdRef.current
            );
            
            if (nodeToMove) {
              console.log("Successfully removed node from parent");
              // Add node after parent in grandparent's children
              // Handle the case where parent_id might be null by providing a fallback
              const parentId = clonedParent.id;
              const grandParentId = clonedParent.parent_id || "";
              
              const success = addNodeAfterParent(
                clonedNodes,
                parentId,
                grandParentId, // We've already checked it's not null above
                nodeToMove
              );
              
              if (success) {
                console.log("Successfully added node after parent");
                setNodes(clonedNodes);
                
                // Focus the unindented node after DOM update
                setTimeout(() => {
                  focusNodeTextarea(activeNodeIdRef.current || '');
                }, 0);
              }
            }
          }
          return;
        }
        
        // At root level with empty content - do nothing
        console.log("Empty root level node - doing nothing");
        return;
      }
      
      // Only proceed to add new nodes if the current node has content
      
      // Case 1: Cursor at beginning - add node above
      if (cursorPosition === 0) {
        const newNodeId = addNodeBefore(activeNodeIdRef.current);
        if (newNodeId) {
          setTimeout(() => {
            focusNodeTextarea(newNodeId);
          }, 0);
        }
      }
      // Case 2: Cursor at the end - add node after (existing behavior)
      else if (cursorPosition === nodeContent.length) {
        const newNodeId = addNodeAfter(activeNodeIdRef.current);
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

        // Update current node with left content
        handleEdit(activeNodeIdRef.current, leftContent);

        // Create new node with right content
        const newNodeId = addNodeAfter(activeNodeIdRef.current, rightContent);

        if (newNodeId && currentNode.children.length > 0) {
          // Move children from current node to the new node
          moveChildrenToNewParent(activeNodeIdRef.current, newNodeId);
        }

        if (newNodeId) {
          setTimeout(() => {
            focusNodeTextarea(newNodeId);
          }, 0);
        }
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
      unindentNode,
    ]
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
      
      console.log("Shift+Tab pressed on node:", activeNodeIdRef.current);
      
      // Implement unindent directly to ensure it works properly
      // Create a copy of the node tree to avoid mutation issues
      const clonedNodes = JSON.parse(JSON.stringify(nodes)) as OutlinerNode[];
      
      // Find the current node and its parent in the cloned tree
      const [clonedNode, clonedParent, indexInParent] = findNode(
        clonedNodes, 
        activeNodeIdRef.current
      );
      
      if (clonedNode && clonedParent && clonedParent.parent_id !== null) {
        console.log("Found node and parent in cloned tree");
        
        // Remove node from its current parent
        const nodeToMove = removeNodeFromParent(
          clonedNodes,
          clonedParent.id,
          activeNodeIdRef.current
        );
        
        if (nodeToMove) {
          console.log("Successfully removed node from parent");
          // Add node after parent in grandparent's children
          const parentId = clonedParent.id;
          const grandParentId = clonedParent.parent_id || ""; // Handle null case
          
          const success = addNodeAfterParent(
            clonedNodes,
            parentId,
            grandParentId,
            nodeToMove
          );
          
          if (success) {
            console.log("Successfully unindented on Shift+Tab");
            setNodes(clonedNodes);
            
            // Focus the unindented node after DOM update
            setTimeout(() => {
              focusNodeTextarea(activeNodeIdRef.current || '');
            }, 0);
          }
        }
      } else {
        console.log("Cannot unindent: no parent or at root level");
      }
    },
    { enableOnFormTags: ["TEXTAREA"] },
    [nodes, findNode, removeNodeFromParent, addNodeAfterParent, focusNodeTextarea]
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

  // Handle Up Arrow - navigate to previous node
  useHotkeys(
    "up",
    (e) => {
      if (!activeNodeIdRef.current) return;
      const targetEl = e.target as HTMLTextAreaElement;
      console.log(
        "activeNodeIdRef.current",
        targetEl.selectionStart,
        activeNodeIdRef.current
      );

      // Only navigate if cursor is at the beginning of the textarea
      if (targetEl.selectionStart === 0) {
        const previousNode = findPreviousNodeInHierarchy(
          activeNodeIdRef.current
        );
        console.log("previousNode", previousNode);

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
