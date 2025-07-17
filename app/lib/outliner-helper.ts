import { nanoid } from "nanoid";
import type { OutlinerNode } from "~/hooks/use-outliner";

// Helper function to get all nodes in flattened order
export const getAllNodesFlattened = (nodes: OutlinerNode[]) => {
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
};

// Helper function to find a node and its parent in the tree
export const findNode = (
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
};

// Helper function to find the previous node in the tree
export const findPreviousNode = (
  nodeId: string,
  nodes: OutlinerNode[]
): OutlinerNode | null => {
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
};

// Find the deepest last child of a node
export const findDeepestLastChild = (node: OutlinerNode): OutlinerNode => {
  if (node.children.length === 0) {
    return node;
  }

  // Get last child
  const lastChild = node.children[node.children.length - 1];

  // Recursively find the deepest last child
  return findDeepestLastChild(lastChild);
};

// Find the previous node in hierarchy for up arrow navigation
export const findPreviousNodeInHierarchy = (
  nodeId: string,
  nodes: OutlinerNode[]
): OutlinerNode | null => {
  const flattenedNodes = getAllNodesFlattened(nodes);
  const currentIndex = flattenedNodes.findIndex((n) => n.id === nodeId);

  if (currentIndex === -1 || currentIndex <= 0) {
    return null; // No previous node
  }

  return flattenedNodes[currentIndex - 1];
};

// Find the next node in hierarchy for down arrow navigation
export const findNextNodeInHierarchy = (
  nodeId: string,
  nodes: OutlinerNode[]
): OutlinerNode | null => {
  const flattenedNodes = getAllNodesFlattened(nodes);
  const currentIndex = flattenedNodes.findIndex((n) => n.id === nodeId);

  if (currentIndex === -1 || currentIndex >= flattenedNodes.length - 1) {
    return null; // No next node
  }

  return flattenedNodes[currentIndex + 1];
};

// Focus a specific node's textarea
export const focusNodeTextarea = (
  nodeId: string,
  cursorPosition: "start" | "end" = "end"
) => {
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
};

// Add a new node at the root level or after a specific node
export const addNodeAfter = (
  afterId: string | null = null,
  content: string = "",
  nodes: OutlinerNode[],
  setNodes: (value: React.SetStateAction<OutlinerNode[]>) => void
) => {
  const newNodeId = generateNodeId();
  const newNode: OutlinerNode = {
    id: newNodeId,
    content: content,
    parent_id: null,
    children: [],
    meta_data: {
      isEditing: true,
      isExpanded: false,
    },
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
        const foundInChildren = insertNodeAfter(nodes[i].children, targetId);
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
};

// Add a new node before a specific node
export const addNodeBefore = (
  beforeId: string,
  content: string = "",
  nodes: OutlinerNode[],
  setNodes: (value: React.SetStateAction<OutlinerNode[]>) => void
) => {
  const newNodeId = generateNodeId();
  const newNode: OutlinerNode = {
    id: newNodeId,
    content: content,
    parent_id: null,
    children: [],
    meta_data: {
      isEditing: true,
      isExpanded: false,
    },
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
        const foundInChildren = insertNodeBefore(nodes[i].children, targetId);
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
};

export const handleAddChild = (
  parentId: string,
  nodes: OutlinerNode[],
  setNodes: (value: React.SetStateAction<OutlinerNode[]>) => void
) => {
  const newNodeId = generateNodeId();
  const newNode: OutlinerNode = {
    id: newNodeId,
    content: "New child",
    parent_id: parentId,
    children: [],
    meta_data: {
      isEditing: true,
      isExpanded: false,
    },
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
};

// Delete a node and its children
export const handleDelete = (
  id: string,
  nodes: OutlinerNode[],
  setNodes: (value: React.SetStateAction<OutlinerNode[]>) => void
) => {
  // Helper function to recursively filter out the node and its children
  const filterNodes = (nodes: OutlinerNode[], id: string): OutlinerNode[] => {
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
};

// Edit a node's content
export const handleEdit = (
  id: string,
  content: string,
  nodes: OutlinerNode[],
  setNodes: (value: React.SetStateAction<OutlinerNode[]>) => void
) => {
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
};

// Remove a node from its parent
export const removeNodeFromParent = (
  nodes: OutlinerNode[],
  parentId: string | null,
  nodeId: string
): OutlinerNode | null => {
  // If it's root level
  if (parentId === null) {
    const index = nodes.findIndex((n) => n.id === nodeId);
    if (index !== -1) {
      const removed = nodes.splice(index, 1)[0];
      return removed;
    }
  } else {
    // Find the parent
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].id === parentId) {
        const index = nodes[i].children.findIndex((n) => n.id === nodeId);
        if (index !== -1) {
          const removed = nodes[i].children.splice(index, 1)[0];
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
          return removed;
        }
      }
    }
  }

  return null;
};

// Add a node to a specific parent
export const addNodeToParent = (
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
};

// Helper function to add node after a specific parent in the hierarchy
export const addNodeAfterParent = (
  nodes: OutlinerNode[],
  parentId: string,
  grandParentId: string | null,
  nodeToAdd: OutlinerNode
): boolean => {
  if (grandParentId === null) {
    // Parent is at root level, which means we're adding the node as a root node
    const parentIndex = nodes.findIndex((n) => n.id === parentId);

    if (parentIndex !== -1) {
      // Set correct parent_id for the node to add - null means it's a root node
      nodeToAdd.parent_id = null;
      // Add node after parent at root level
      nodes.splice(parentIndex + 1, 0, nodeToAdd);
      return true;
    }
    return false;
  }

  // Find the grandparent at root level first
  const rootGrandparent = nodes.find((n) => n.id === grandParentId);
  if (rootGrandparent) {
    // Found grandparent at root level
    const parentIndex = rootGrandparent.children.findIndex(
      (n) => n.id === parentId
    );

    if (parentIndex !== -1) {
      // Set correct parent_id for the node to add
      nodeToAdd.parent_id = grandParentId;
      // Add node after parent in grandparent's children
      rootGrandparent.children.splice(parentIndex + 1, 0, nodeToAdd);
      return true;
    }
  }

  // Search deeper in the tree
  for (let i = 0; i < nodes.length; i++) {
    // Check if this node is the grandparent
    if (nodes[i].id === grandParentId) {
      // Found grandparent, add the node after the parent
      const parentIndex = nodes[i].children.findIndex((n) => n.id === parentId);

      if (parentIndex !== -1) {
        // Set correct parent_id for the node to add
        nodeToAdd.parent_id = grandParentId;
        // Add node after parent in grandparent's children
        nodes[i].children.splice(parentIndex + 1, 0, nodeToAdd);
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
        return true;
      }
    }
  }

  return false;
};

// Find previous sibling's ID
export const getPreviousSiblingId = (
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
        const found = getPreviousSiblingId(nodes[i].children, parentId, nodeId);
        if (found) return found;
      }
    }
  }

  return null;
};

// Helper function to move children to a new parent node
// Helper function to move children from one node to another within a nodes tree
// This doesn't update state, just manipulates the tree
export const moveChildrenBetweenNodes = (
  nodes: OutlinerNode[],
  sourceId: string,
  targetId: string
): boolean => {
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

  const sourceNode = findSourceNode(nodes);

  if (sourceNode && sourceNode.children.length > 0) {
    const childrenToMove = [...sourceNode.children];
    // Clear children from source node
    sourceNode.children = [];
    return moveChildrenTo(nodes, childrenToMove);
  }

  return false;
};

// Public function that updates state after moving children
export const moveChildrenToNewParent = (
  sourceId: string,
  targetId: string,
  nodes: OutlinerNode[],
  setNodes: (value: React.SetStateAction<OutlinerNode[]>) => void
) => {
  const updatedNodes = JSON.parse(JSON.stringify(nodes)) as OutlinerNode[];
  if (moveChildrenBetweenNodes(updatedNodes, sourceId, targetId)) {
    setNodes(updatedNodes);
    return true;
  }
  return false;
};

// Helper function to indent a node (move to child's level)
export const indentNode = (
  nodeId: string | null,
  nodes: OutlinerNode[],
  setNodes: (value: React.SetStateAction<OutlinerNode[]>) => void
) => {
  if (!nodeId) return;

  const [currentNode, parentNode, indexInParent] = findNode(nodes, nodeId);
  if (!currentNode) return;

  // Cannot indent root level item without siblings or first item in list
  if (indexInParent <= 0) return;

  // Make this node a child of previous sibling
  const clonedNodes = JSON.parse(JSON.stringify(nodes)) as OutlinerNode[];

  // Get previous sibling in same parent
  const prevSiblingId = getPreviousSiblingId(
    clonedNodes,
    parentNode?.id || null,
    nodeId
  );

  if (!prevSiblingId) return;

  // Remove node from its current parent
  const nodeToMove = removeNodeFromParent(
    clonedNodes,
    parentNode?.id || null,
    nodeId
  );

  // Add as child of previous sibling
  if (nodeToMove) {
    if (addNodeToParent(clonedNodes, prevSiblingId, nodeToMove)) {
      setNodes(clonedNodes);
    }
  }
};

// Helper function to unindent a node (move to parent's level)
export const unIndentNode = (
  activeNodeIdRef: React.RefObject<string | null>,
  nodes: OutlinerNode[],
  setNodes: (value: React.SetStateAction<OutlinerNode[]>) => void
) => {
  if (!activeNodeIdRef.current) return;
  // Implement unindent directly to ensure it works properly
  // Create a copy of the node tree to avoid mutation issues
  const clonedNodes = JSON.parse(JSON.stringify(nodes)) as OutlinerNode[];

  // Find the current node and its parent in the cloned tree
  const [clonedNode, clonedParent, indexInParent] = findNode(
    clonedNodes,
    activeNodeIdRef.current
  );

  // If we have a node and a parent, we can unindent
  if (clonedNode && clonedParent) {
    // Remove node from its current parent
    const nodeToMove = removeNodeFromParent(
      clonedNodes,
      clonedParent.id,
      activeNodeIdRef.current
    );

    if (nodeToMove) {
      // Add node after parent in its parent's children list
      // If parent is at root level (parent_id is null), then the node will become a root node
      const parentId = clonedParent.id;
      const grandParentId = clonedParent.parent_id; // Can be null for root-level parents

      const success = addNodeAfterParent(
        clonedNodes,
        parentId,
        grandParentId,
        nodeToMove
      );

      if (success) {
        setNodes(clonedNodes);

        // Focus the unindented node after DOM update
        setTimeout(() => {
          focusNodeTextarea(activeNodeIdRef.current || "");
        }, 0);
      }
      return success;
    }
  }
};

export const generateNodeId = () => `node_${nanoid()}`;
