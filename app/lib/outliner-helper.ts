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

export const generateNodeId = () => `node_${nanoid()}`;


