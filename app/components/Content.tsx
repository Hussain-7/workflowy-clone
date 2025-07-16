import React, { useState, useRef, useEffect } from "react";
import { FaCircle } from "react-icons/fa";

// Define the structure of an outliner node
interface OutlinerNode {
  id: string;
  content: string;
  parent_id: string | null;
  children: OutlinerNode[];
  isEditing?: boolean;
}

// OutlinerItem component for recursive rendering
const OutlinerItem: React.FC<{
  node: OutlinerNode;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => void;
  onToggleEdit: (id: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>, id: string) => void;
  level: number;
  isLastNode: boolean;
}> = ({
  node,
  onAddChild,
  onDelete,
  onEdit,
  onToggleEdit,
  onKeyDown,
  level,
  isLastNode,
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  const autoResizeTextarea = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto"; // Reset height to recalculate
    textarea.style.height = textarea.scrollHeight + "px";
  };

  // Focus on the input field when in editing mode and resize
  useEffect(() => {
    if (node.isEditing && inputRef.current) {
      inputRef.current.focus();
      // Place cursor at the end of text
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
      autoResizeTextarea(inputRef.current);
    }
  }, [node.isEditing]);

  // Auto-resize on content change
  useEffect(() => {
    if (inputRef.current) {
      autoResizeTextarea(inputRef.current);
    }
  }, [node.content]);

  return (
    <div className="outliner-item" style={{ marginLeft: `${level * 20}px` }}>
      <div className="relative pl-6 flex items-center justify-center">
        {/* Bullet point */}
        <div className="absolute left-0 top-3 -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:bg-gray-200 hover:cursor-pointer rounded-full transition-colors">
          <FaCircle className="w-2 h-2 aspect-square text-gray-700" />
        </div>
        {/* Borderless, transparent input field with text wrapping */}
        <textarea
          ref={inputRef}
          value={node.content}
          onChange={(e) => {
            onEdit(node.id, e.target.value);
            autoResizeTextarea(e.target);
          }}
          onKeyDown={(e) => onKeyDown(e, node.id)}
          className="w-full text-black border-none focus:ring-0 outline-none bg-transparent resize-none overflow-hidden block"
          autoFocus={node.isEditing}
          placeholder="Type here..."
          data-node-id={node.id}
          rows={1}
          style={{
            lineHeight: "1.5",
            margin: 0,
            padding: 0,
          }}
        />
      </div>
      {/* Render children recursively */}
      {node.children.length > 0 && (
        <div className="children">
          {node.children.map((child, index) => (
            <OutlinerItem
              key={child.id}
              node={child}
              onAddChild={onAddChild}
              onDelete={onDelete}
              onEdit={onEdit}
              onToggleEdit={onToggleEdit}
              onKeyDown={onKeyDown}
              level={level + 1}
              isLastNode={index === node.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

type Props = {};

const Content = (props: Props) => {
  // Generate a unique ID for new nodes
  const generateId = () =>
    `node_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  // Initial data structure with a root node
  const [nodes, setNodes] = useState<OutlinerNode[]>([
    {
      id: generateId(),
      content: "Welcome to Brainlift Outliner",
      parent_id: null,
      children: [],
    },
  ]);

  // Add a new node at the root level or after a specific node
  const addNodeAfter = (afterId: string | null = null) => {
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
    }
  };

  // Add a child node to a parent node
  const handleAddChild = (parentId: string) => {
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
  };

  // Delete a node and its children
  const handleDelete = (id: string) => {
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
  const handleEdit = (id: string, content: string) => {
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

  // Toggle edit mode for a node
  const handleToggleEdit = (id: string) => {
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

    const updatedNodes = toggleNodeEdit(JSON.parse(JSON.stringify(nodes)), id);
    setNodes(updatedNodes);
  };

  // Handle keyboard events for the outliner items
  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    nodeId: string
  ) => {
    const findNode = (
      nodes: OutlinerNode[],
      id: string
    ): [OutlinerNode | null, OutlinerNode | null, number] => {
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id === id) {
          return [nodes[i], null, i]; // Found node, no parent (root level), index
        }

        // Look in children
        if (nodes[i].children.length > 0) {
          const [found, , index] = findNode(nodes[i].children, id);
          if (found) {
            return [found, nodes[i], index]; // Found node, its parent, index in parent's children
          }
        }
      }

      return [null, null, -1]; // Not found
    };

    const [currentNode, parentNode, indexInParent] = findNode(nodes, nodeId);
    if (!currentNode) return;

    // Find the previous node in the tree (for backspace handling)
    const findPreviousNode = (nodes: OutlinerNode[]): OutlinerNode | null => {
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

    // Enter: Create new item at same level
    if (e.key === "Enter") {
      e.preventDefault();
      addNodeAfter(nodeId);
    }
    // Tab: Make current node a child of previous node
    else if (e.key === "Tab" && !e.shiftKey) {
      e.preventDefault();

      // Cannot indent root level item without siblings
      if (!parentNode || indexInParent <= 0) return;

      // Make this node a child of previous sibling
      const clonedNodes = JSON.parse(JSON.stringify(nodes)) as OutlinerNode[];
      const previousSiblingIndex = indexInParent - 1;

      const removeNodeFromParent = (
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
      };

      const addNodeToParent = (
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
            const added = addNodeToParent(
              nodes[i].children,
              parentId,
              nodeToAdd
            );
            if (added) return true;
          }
        }

        return false;
      };

      // Find previous sibling's ID
      const getPreviousSiblingId = (
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
      };

      const prevSiblingId = getPreviousSiblingId(
        clonedNodes,
        parentNode.id,
        nodeId
      );
      if (!prevSiblingId) return;

      const nodeToMove = removeNodeFromParent(
        clonedNodes,
        parentNode.id,
        nodeId
      );
      if (nodeToMove) {
        if (addNodeToParent(clonedNodes, prevSiblingId, nodeToMove)) {
          setNodes(clonedNodes);
        }
      }
    }
    // Shift+Tab: Unindent - move to parent level
    else if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();

      // Can't unindent if at root or if parent is root
      if (!parentNode || parentNode.parent_id === null) return;

      const clonedNodes = JSON.parse(JSON.stringify(nodes)) as OutlinerNode[];

      const removeNodeFromParent = (
        nodes: OutlinerNode[],
        parentId: string,
        nodeId: string
      ): OutlinerNode | null => {
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

        return null;
      };

      const insertAfterParent = (
        nodes: OutlinerNode[],
        grandparentId: string | null,
        parentId: string,
        nodeToAdd: OutlinerNode
      ): boolean => {
        if (grandparentId === null) {
          // Insert at root level after parent
          const parentIndex = nodes.findIndex((n) => n.id === parentId);
          if (parentIndex !== -1) {
            nodeToAdd.parent_id = null;
            nodes.splice(parentIndex + 1, 0, nodeToAdd);
            return true;
          }
        } else {
          for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === grandparentId) {
              const parentIndex = nodes[i].children.findIndex(
                (n) => n.id === parentId
              );
              if (parentIndex !== -1) {
                nodeToAdd.parent_id = grandparentId;
                nodes[i].children.splice(parentIndex + 1, 0, nodeToAdd);
                return true;
              }
            }

            if (nodes[i].children.length > 0) {
              const inserted = insertAfterParent(
                nodes[i].children,
                grandparentId,
                parentId,
                nodeToAdd
              );
              if (inserted) return true;
            }
          }
        }

        return false;
      };

      const findGrandparentId = (
        nodes: OutlinerNode[],
        parentId: string
      ): string | null => {
        for (let i = 0; i < nodes.length; i++) {
          if (nodes[i].children.some((child) => child.id === parentId)) {
            return nodes[i].id;
          }

          if (nodes[i].children.length > 0) {
            const found = findGrandparentId(nodes[i].children, parentId);
            if (found) return found;
          }
        }

        return null;
      };

      const grandparentId = parentNode.parent_id;
      const nodeToMove = removeNodeFromParent(
        clonedNodes,
        parentNode.id,
        nodeId
      );

      if (nodeToMove) {
        if (
          insertAfterParent(
            clonedNodes,
            grandparentId,
            parentNode.id,
            nodeToMove
          )
        ) {
          setNodes(clonedNodes);
        }
      }
    }
    // Backspace: Delete empty node and move to previous node
    else if (e.key === "Backspace" && currentNode.content === "") {
      const targetEl = e.target as HTMLTextAreaElement;
      if (targetEl.selectionStart === 0) {
        e.preventDefault();

        // Find the previous node to focus on after deletion
        const previousNode = findPreviousNode(nodes);
        if (!previousNode) return; // Don't delete if there's no previous node

        handleDelete(nodeId);

        // Focus on previous node
        setTimeout(() => {
          const previousInput = document.querySelector(
            `[data-node-id="${previousNode.id}"]`
          ) as HTMLTextAreaElement;
          if (previousInput) {
            previousInput.focus();
            // For textareas, we need to set the selection differently
            previousInput.selectionStart = previousInput.value.length;
            previousInput.selectionEnd = previousInput.value.length;
          }
        }, 0);
      }
    }
  };

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
  }, []);

  return (
    <div className="px-4 py-6 w-[90vw] md:w-[700px] mt-10 mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-black">Outliner</h1>
      <div className="outliner border-0 py-4 bg-white h-fit">
        {nodes.length === 0 ? (
          <div className="text-gray-500 italic">Loading outliner...</div>
        ) : (
          nodes.map((node, index) => (
            <OutlinerItem
              key={node.id}
              node={node}
              onAddChild={handleAddChild}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onToggleEdit={handleToggleEdit}
              onKeyDown={handleKeyDown}
              level={0}
              isLastNode={index === nodes.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Content;
