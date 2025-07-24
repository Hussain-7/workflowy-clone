import { create } from "zustand";
import { nanoid } from "nanoid";
import { persist, createJSONStorage } from "zustand/middleware";

// Define the structure of an outliner node
export interface OutlinerNode {
  id: string;
  content: string;
  parent_id: string | null;
  children: OutlinerNode[];
  meta_data: {
    isEditing?: boolean;
    isExpanded?: boolean;
    isSelected?: boolean;
  };
}

interface OutlinerStore {
  // State
  // overall data
  nodes: OutlinerNode[];
  selectedNodeId: string | null;
  selectedNodeIds: string[];
  isSelecting: boolean;
  selectionStartNodeId: string | null;
  isLoading: boolean;
  // Current Focused node

  // Basic operations
  setNodes: (nodes: OutlinerNode[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  setSelectedNodeIds: (ids: string[]) => void;
  setIsSelecting: (selecting: boolean) => void;
  setSelectionStartNodeId: (id: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  initializeNodes: (defaultNodes: OutlinerNode[]) => void;

  // Utility methods
  getAllNodesFlattened: () => OutlinerNode[];
  getNodeById: (id: string) => OutlinerNode | null;
  findNode: (
    id: string | null
  ) => [OutlinerNode | null, OutlinerNode | null, number];
  findPreviousNodeInHierarchy: (nodeId: string) => OutlinerNode | null;
  findNextNodeInHierarchy: (nodeId: string) => OutlinerNode | null;
  findDeepestLastChild: (node: OutlinerNode) => OutlinerNode;

  // Node manipulation methods
  handleNodeUpdate: (id: string, data: Partial<OutlinerNode>) => void;
  handleDelete: (id: string) => void;
  addNodeAfter: (afterId: string | null, content?: string) => string | null;
  addNodeBefore: (beforeId: string, content?: string) => string | null;
  handleAddChild: (parentId: string | null) => void;
  indentNode: (nodeId: string | null) => void;
  unIndentNode: (nodeId: string | null) => boolean;

  // Keyboard handling methods
  handleEnterKey: (
    nodeId: string,
    nodeText: string,
    isEmpty: boolean,
    type: "start" | "middle" | "end",
    leftContent: string,
    rightContent: string
  ) => void;
  handleBackspaceKey: (nodeId: string, isEmpty: boolean) => void;
  handleTabKey: (nodeId: string | null) => void;
  handleShiftTabKey: (nodeId: string | null) => void;
  handleArrowUp: (nodeId: string) => void;
  handleArrowDown: (nodeId: string) => void;

  // Helper methods
  focusNodeTextarea: (nodeId: string, cursorPosition?: "start" | "end") => void;
  generateNodeId: () => string;
  parseAndInsertStructuredText: (
    text: string,
    targetNodeId: string | null,
    insertAfter?: boolean,
    asChildren?: boolean
  ) => void;
  handlePaste: (
    e: React.ClipboardEvent<HTMLTextAreaElement>,
    nodeId: string
  ) => void;

  // Selection methods
  startSelection: (nodeId: string) => void;
  updateSelection: (nodeId: string) => void;
  endSelection: () => void;
  clearSelection: () => void;
  updateNodeSelection: (nodeId: string, isSelected: boolean) => void;
  isNodeSelected: (nodeId: string) => boolean;
  // For copying selected nodes
  getSelectedNodes: () => OutlinerNode[];
  // For deleting selected nodes
  deleteSelectedNodes: () => void;

  // Future API methods
  fetchNodes: () => Promise<void>;
  saveNodes: () => Promise<void>;
}

const useOutlinerStore = create<OutlinerStore>()(
  persist(
    (set, get) => ({
      // Initial state
      // All combined nodes
      nodes: [],
      selectedNodeId: null,
      selectedNodeIds: [],
      isSelecting: false,
      selectionStartNodeId: null,
      isLoading: true,

      // Basic operations
      setNodes: (nodes) => set({ nodes }),
      setSelectedNodeId: (id) => set({ selectedNodeId: id }),
      setSelectedNodeIds: (ids) => set({ selectedNodeIds: ids }),
      setIsSelecting: (selecting) => set({ isSelecting: selecting }),
      setSelectionStartNodeId: (id) => set({ selectionStartNodeId: id }),
      setIsLoading: (loading) => set({ isLoading: loading }),
      initializeNodes: (defaultNodes) => {
        if (defaultNodes.length === 0) {
          const newNodeId = get().generateNodeId();
          set({
            nodes: [
              {
                id: newNodeId,
                content: "",
                parent_id: null,
                children: [],
                meta_data: {
                  isEditing: true,
                  isExpanded: false,
                },
              },
            ],
          });
        } else {
          set({ nodes: defaultNodes });
        }
      },

      // Utility methods
      getAllNodesFlattened: () => {
        const { nodes } = get();
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
      },

      getNodeById: (id: string) => {
        const { getAllNodesFlattened } = get();
        const flattenedData = getAllNodesFlattened();
        return flattenedData.find((doc) => doc.id === id) || null;
      },

      findNode: (id: string | null) => {
        if (!id) return [null, null, -1];
        const { nodes } = get();

        const search = (
          nodes: OutlinerNode[],
          targetId: string
        ): [OutlinerNode | null, OutlinerNode | null, number] => {
          for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === targetId) {
              return [nodes[i], null, i];
            }

            if (nodes[i].children.length > 0) {
              const [found, parent, index] = search(
                nodes[i].children,
                targetId
              );
              if (found) {
                return [found, parent || nodes[i], index];
              }
            }
          }
          return [null, null, -1];
        };

        return search(nodes, id);
      },

      findPreviousNodeInHierarchy: (nodeId: string) => {
        const flattenedNodes = get().getAllNodesFlattened();
        const currentIndex = flattenedNodes.findIndex((n) => n.id === nodeId);

        if (currentIndex === -1 || currentIndex <= 0) {
          return null;
        }

        return flattenedNodes[currentIndex - 1];
      },

      findNextNodeInHierarchy: (nodeId: string) => {
        const flattenedNodes = get().getAllNodesFlattened();
        const currentIndex = flattenedNodes.findIndex((n) => n.id === nodeId);

        if (currentIndex === -1 || currentIndex >= flattenedNodes.length - 1) {
          return null;
        }

        return flattenedNodes[currentIndex + 1];
      },

      findDeepestLastChild: (node: OutlinerNode) => {
        if (node.children.length === 0) {
          return node;
        }

        const lastChild = node.children[node.children.length - 1];
        return get().findDeepestLastChild(lastChild);
      },

      handleNodeUpdate: (id: string, data: Partial<OutlinerNode>) => {
        const { nodes } = get();

        const updateNode = (
          nodes: OutlinerNode[],
          id: string,
          data: Partial<OutlinerNode>
        ): OutlinerNode[] => {
          return nodes.map((node) => {
            if (node.id === id) {
              return {
                ...node,
                ...data,
                meta_data: { ...node.meta_data, ...data.meta_data },
              };
            }

            if (node.children.length > 0) {
              return {
                ...node,
                children: updateNode(node.children, id, data),
              };
            }

            return node;
          });
        };

        const updatedNodes = updateNode(
          JSON.parse(JSON.stringify(nodes)),
          id,
          data
        );
        set({ nodes: updatedNodes });
      },

      handleDelete: (id: string) => {
        const { nodes } = get();

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
        set({ nodes: updatedNodes });
      },

      addNodeAfter: (afterId: string | null = null, content: string = "") => {
        const { nodes, generateNodeId } = get();
        const newNodeId = generateNodeId();
        const newNode: OutlinerNode = {
          id: newNodeId,
          content: content,
          parent_id: null,
          children: [],
          meta_data: {
            isEditing: true,
            isExpanded: true,
          },
        };

        if (afterId === null) {
          set({ nodes: [...nodes, newNode] });
          return newNodeId;
        }

        const updatedNodes = JSON.parse(
          JSON.stringify(nodes)
        ) as OutlinerNode[];

        const insertNodeAfter = (
          nodes: OutlinerNode[],
          targetId: string
        ): boolean => {
          for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === targetId) {
              newNode.parent_id = nodes[i].parent_id;
              nodes.splice(i + 1, 0, newNode);
              return true;
            }

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

        const nodeFound = insertNodeAfter(updatedNodes, afterId);

        if (nodeFound) {
          set({ nodes: updatedNodes });
          return newNodeId;
        }

        return null;
      },

      addNodeBefore: (beforeId: string, content: string = "") => {
        const { nodes, generateNodeId } = get();
        const newNodeId = generateNodeId();
        const newNode: OutlinerNode = {
          id: newNodeId,
          content: content,
          parent_id: null,
          children: [],
          meta_data: {
            isEditing: true,
            isExpanded: true,
          },
        };

        const updatedNodes = JSON.parse(
          JSON.stringify(nodes)
        ) as OutlinerNode[];

        const insertNodeBefore = (
          nodes: OutlinerNode[],
          targetId: string
        ): boolean => {
          for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === targetId) {
              newNode.parent_id = nodes[i].parent_id;
              nodes.splice(i, 0, newNode);
              return true;
            }

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

        const nodeFound = insertNodeBefore(updatedNodes, beforeId);

        if (nodeFound) {
          set({ nodes: updatedNodes });
          return newNodeId;
        }

        return null;
      },

      handleAddChild: (parentId: string | null) => {
        const { nodes, generateNodeId } = get();
        const newNodeId = generateNodeId();
        const newNode: OutlinerNode = {
          id: newNodeId,
          content: "",
          parent_id: parentId,
          children: [],
          meta_data: {
            isEditing: true,
            isExpanded: true,
          },
        };

        const updatedNodes = JSON.parse(
          JSON.stringify(nodes)
        ) as OutlinerNode[];

        // If parentId is null, add to root level
        if (parentId === null) {
          updatedNodes.push(newNode);
          set({ nodes: updatedNodes });
          return;
        }

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
              const added = addChildToNode(
                nodes[i].children,
                parentId,
                newNode
              );
              if (added) return true;
            }
          }
          return false;
        };

        const nodeAdded = addChildToNode(updatedNodes, parentId, newNode);
        if (nodeAdded) {
          set({ nodes: updatedNodes });
        }
      },

      indentNode: (nodeId: string | null) => {
        if (!nodeId) return;

        const { nodes, findNode } = get();
        const [currentNode, parentNode, indexInParent] = findNode(nodeId);
        if (!currentNode || indexInParent <= 0) return;

        const clonedNodes = JSON.parse(JSON.stringify(nodes)) as OutlinerNode[];

        // Helper functions for indenting
        const getPreviousSiblingId = (
          nodes: OutlinerNode[],
          parentId: string | null,
          nodeId: string
        ): string | null => {
          if (parentId === null) {
            const index = nodes.findIndex((n) => n.id === nodeId);
            if (index > 0) {
              return nodes[index - 1].id;
            }
          } else {
            for (let i = 0; i < nodes.length; i++) {
              if (nodes[i].id === parentId) {
                const index = nodes[i].children.findIndex(
                  (n) => n.id === nodeId
                );
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

        const removeNodeFromParent = (
          nodes: OutlinerNode[],
          parentId: string | null,
          nodeId: string
        ): OutlinerNode | null => {
          if (parentId === null) {
            const index = nodes.findIndex((n) => n.id === nodeId);
            if (index !== -1) {
              return nodes.splice(index, 1)[0];
            }
          } else {
            for (let i = 0; i < nodes.length; i++) {
              if (nodes[i].id === parentId) {
                const index = nodes[i].children.findIndex(
                  (n) => n.id === nodeId
                );
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

        const prevSiblingId = getPreviousSiblingId(
          clonedNodes,
          parentNode?.id || null,
          nodeId
        );
        if (!prevSiblingId) return;

        const nodeToMove = removeNodeFromParent(
          clonedNodes,
          parentNode?.id || null,
          nodeId
        );

        if (nodeToMove) {
          if (addNodeToParent(clonedNodes, prevSiblingId, nodeToMove)) {
            set({ nodes: clonedNodes });
          }
        }
      },

      unIndentNode: (nodeId: string | null) => {
        if (!nodeId) return false;

        const { nodes, findNode, focusNodeTextarea } = get();
        const clonedNodes = JSON.parse(JSON.stringify(nodes)) as OutlinerNode[];
        const [clonedNode, clonedParent] = findNode(nodeId);
        if (!clonedNode || !clonedParent) return false;

        // Helper functions for unindenting
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

        const addNodeAfterParent = (
          nodes: OutlinerNode[],
          parentId: string,
          grandParentId: string | null,
          nodeToAdd: OutlinerNode
        ): boolean => {
          if (grandParentId === null) {
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
              const parentIndex = nodes[i].children.findIndex(
                (n) => n.id === parentId
              );
              if (parentIndex !== -1) {
                nodeToAdd.parent_id = grandParentId;
                nodes[i].children.splice(parentIndex + 1, 0, nodeToAdd);
                return true;
              }
            }

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

        const nodeToMove = removeNodeFromParent(
          clonedNodes,
          clonedParent.id,
          nodeId
        );

        if (nodeToMove) {
          const parentId = clonedParent.id;
          const grandParentId = clonedParent.parent_id;

          const success = addNodeAfterParent(
            clonedNodes,
            parentId,
            grandParentId,
            nodeToMove
          );

          if (success) {
            set({ nodes: clonedNodes });
            focusNodeTextarea(nodeId);
          }
          return success;
        }

        return false;
      },

      // Keyboard handling methods
      handleEnterKey: (
        nodeId: string,
        nodeText: string,
        isEmpty: boolean,
        type: "start" | "middle" | "end",
        leftContent: string,
        rightContent: string
      ) => {
        const {
          nodes,
          findNode,
          addNodeAfter,
          addNodeBefore,
          unIndentNode,
          generateNodeId,
          focusNodeTextarea,
        } = get();
        const [currentNode] = findNode(nodeId);
        const nodeContent = nodeText || "";
        if (!currentNode) return;
        // Special case: If node is empty, and not at root level, unindent it
        if (isEmpty) {
          const status = unIndentNode(nodeId);
          if (!status) {
            const newNodeId = addNodeAfter(nodeId, "");
            if (newNodeId) {
              focusNodeTextarea(newNodeId);
            }
          }
          return;
        }

        // Case 1: Cursor at beginning - add node above
        if (type === "start") {
          const newNodeId = addNodeBefore(nodeId, "");
          if (newNodeId) {
            focusNodeTextarea(newNodeId);
          }
        }
        // Case 2: Cursor at the end - add node after
        else if (type === "end") {
          const newNodeId = addNodeAfter(nodeId, "");
          if (newNodeId) {
            focusNodeTextarea(newNodeId);
          }
        }
        // Case 3: Cursor in the middle - split content
        else {
          const updatedNodes = JSON.parse(
            JSON.stringify(nodes)
          ) as OutlinerNode[];

          // Update current node with left content
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
                const updated = updateNodeContent(
                  nodes[i].children,
                  id,
                  content
                );
                if (updated) return true;
              }
            }
            return false;
          };

          updateNodeContent(updatedNodes, nodeId, leftContent);

          // Create new node with right content
          const newNodeId = generateNodeId();
          const newNode: OutlinerNode = {
            id: newNodeId,
            content: rightContent,
            parent_id: currentNode.parent_id,
            children: [],
            meta_data: {
              isEditing: true,
              isExpanded: true,
            },
          };

          // Insert new node after current node
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

          insertNodeAfter(updatedNodes, nodeId);

          // Move children if needed
          if (currentNode.children.length > 0) {
            const moveChildrenBetweenNodes = (
              nodes: OutlinerNode[],
              sourceId: string,
              targetId: string
            ): boolean => {
              const findSourceNode = (
                nodes: OutlinerNode[]
              ): OutlinerNode | null => {
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

              const moveChildrenTo = (
                nodes: OutlinerNode[],
                children: OutlinerNode[]
              ): boolean => {
                for (let i = 0; i < nodes.length; i++) {
                  if (nodes[i].id === targetId) {
                    nodes[i].children = [...children];
                    for (let child of nodes[i].children) {
                      child.parent_id = targetId;
                    }
                    return true;
                  }

                  if (nodes[i].children.length > 0) {
                    const movedToChild = moveChildrenTo(
                      nodes[i].children,
                      children
                    );
                    if (movedToChild) return true;
                  }
                }
                return false;
              };

              const sourceNode = findSourceNode(nodes);
              if (sourceNode && sourceNode.children.length > 0) {
                const childrenToMove = [...sourceNode.children];
                sourceNode.children = [];
                return moveChildrenTo(nodes, childrenToMove);
              }
              return false;
            };

            moveChildrenBetweenNodes(updatedNodes, nodeId, newNodeId);
          }

          set({ nodes: updatedNodes });
          focusNodeTextarea(newNodeId, "start");
        }
      },

      handleBackspaceKey: (nodeId: string, isEmpty: boolean) => {
        const { findNode, handleDelete, findPreviousNodeInHierarchy, focusNodeTextarea } = get();
        const [currentNode] = findNode(nodeId);

        // Delete current node if it is empty and at set cursor a start of previous node
        if (currentNode && isEmpty) {
          const previousNode = findPreviousNodeInHierarchy(nodeId);
          handleDelete(nodeId);
          // Try to focus on previous node
          console.log("previousNode", previousNode);
          if (previousNode) {
            // Set timeout to allow DOM to update
            focusNodeTextarea(previousNode.id, "end");
          }
        }
      },

      handleTabKey: (nodeId: string | null) => {
        if (!nodeId) return;
        get().indentNode(nodeId);
        get().focusNodeTextarea(nodeId, "end");
      },

      handleShiftTabKey: (nodeId: string | null) => {
        if (!nodeId) return;
        get().unIndentNode(nodeId);
        get().focusNodeTextarea(nodeId, "end");
      },

      handleArrowUp: (nodeId: string) => {
        const { findPreviousNodeInHierarchy, focusNodeTextarea } = get();
        const previousNode = findPreviousNodeInHierarchy(nodeId);
        console.log("previousNode", previousNode);
        if (previousNode) {
          focusNodeTextarea(previousNode.id, "start");
        }
      },

      handleArrowDown: (nodeId: string | null) => {
        if (!nodeId) return;
        const { findNextNodeInHierarchy, focusNodeTextarea } = get();
        const nextNode = findNextNodeInHierarchy(nodeId);
        console.log("nextNode", nextNode);
        if (nextNode) {
          focusNodeTextarea(nextNode.id, "start");
        }
      },

      // Helper methods
      focusNodeTextarea: (nodeId: string, cursorPosition?: "start" | "end") => {
        setTimeout(() => {
          const parentDiv = document.querySelector(
            `[data-node-id="${nodeId}"]`
          ) as HTMLElement | null;

          if (parentDiv) {
            // Find the first contenteditable child within the parent div
            const editable = parentDiv.querySelector(
              '[contenteditable="true"]'
            ) as HTMLElement | null;
            if (editable) {
              editable.focus();
              const selection = window.getSelection();
              const range = document.createRange();
              range.selectNodeContents(editable);

              if (cursorPosition === "start") {
                range.collapse(true);
              } else {
                range.collapse(false);
              }
              selection?.removeAllRanges();
              selection?.addRange(range);
            } else {
              // fallback: focus the parent itself if no child found
              parentDiv.focus();
            }
          }
        }, 0);
      },

      generateNodeId: () => `node_${nanoid()}`,

      parseAndInsertStructuredText: (
        text: string,
        targetNodeId: string | null,
        insertAfter: boolean = true,
        asChildren: boolean = false
      ) => {
        console.log("parseAndInsertStructuredText called with:", {
          text,
          targetNodeId,
          insertAfter,
          asChildren,
        });

        const lines = text.split("\n").filter((line) => line.trim() !== "");
        const { nodes, generateNodeId } = get();

        console.log("Filtered lines:", lines);
        console.log("Lines length:", lines.length);

        if (lines.length === 0) {
          console.log("No lines to process, returning early");
          return;
        }

        // Parse lines and detect indentation levels
        const parsedLines = lines.map((line) => {
          const indentMatch = line.match(/^(\s*)/);
          const indentLevel = indentMatch ? indentMatch[1].length : 0;
          const content = line
            .trim()
            .replace(/^[-*+]\s*/, "")
            .replace(/^\d+\.\s*/, "");

          console.log(
            `Parsing line: "${line}" | Indent: ${indentLevel} | Content: "${content}"`
          );

          return {
            content,
            indentLevel,
            id: generateNodeId(),
          };
        });

        console.log("Parsed lines:", parsedLines);

        // Build hierarchical structure
        const nodeStack: { node: OutlinerNode; level: number }[] = [];
        const newNodes: OutlinerNode[] = [];

        for (const parsedLine of parsedLines) {
          const newNode: OutlinerNode = {
            id: parsedLine.id,
            content: parsedLine.content,
            parent_id: null,
            children: [],
            meta_data: {
              isEditing: false,
              isExpanded: true,
            },
          };

          console.log(
            `Processing node: "${parsedLine.content}" at level ${parsedLine.indentLevel}`
          );

          // Find the correct parent based on indentation
          while (
            nodeStack.length > 0 &&
            nodeStack[nodeStack.length - 1].level >= parsedLine.indentLevel
          ) {
            nodeStack.pop();
          }

          if (nodeStack.length === 0) {
            // Root level node
            console.log(`Adding as root node: "${parsedLine.content}"`);
            newNodes.push(newNode);
          } else {
            // Child node
            const parent = nodeStack[nodeStack.length - 1].node;
            newNode.parent_id = parent.id;
            parent.children.push(newNode);
            console.log(
              `Adding as child of "${parent.content}": "${parsedLine.content}"`
            );
          }

          nodeStack.push({ node: newNode, level: parsedLine.indentLevel });
        }

        console.log("Final new nodes structure:", newNodes);

        // Insert the new nodes into the existing tree
        const updatedNodes = JSON.parse(
          JSON.stringify(nodes)
        ) as OutlinerNode[];

        const insertNodes = (
          nodes: OutlinerNode[],
          newNodes: OutlinerNode[],
          targetId: string | null,
          insertAfter: boolean,
          asChildren: boolean
        ): boolean => {
          console.log(
            `Inserting ${newNodes.length} nodes. Target: ${targetId}, After: ${insertAfter}, As Children: ${asChildren}`
          );

          if (targetId === null) {
            // Insert at root level
            console.log("Inserting at root level");
            if (insertAfter) {
              nodes.push(...newNodes);
            } else {
              nodes.unshift(...newNodes);
            }
            return true;
          }

          // Find target node and insert
          for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].id === targetId) {
              console.log(`Found target node at index ${i}, inserting nodes`);
              if (asChildren) {
                // Insert as children of the target node
                nodes[i].children = [...nodes[i].children, ...newNodes];
                for (let child of newNodes) {
                  child.parent_id = targetId;
                }
              } else {
                // Insert as siblings
                if (insertAfter) {
                  nodes.splice(i + 1, 0, ...newNodes);
                } else {
                  nodes.splice(i, 0, ...newNodes);
                }
              }
              return true;
            }

            if (nodes[i].children.length > 0) {
              const inserted = insertNodes(
                nodes[i].children,
                newNodes,
                targetId,
                insertAfter,
                asChildren
              );
              if (inserted) return true;
            }
          }
          console.log("Target node not found");
          return false;
        };

        const inserted = insertNodes(
          updatedNodes,
          newNodes,
          targetNodeId,
          insertAfter,
          asChildren
        );
        console.log("Insertion result:", inserted);

        if (inserted) {
          console.log("Setting updated nodes:", updatedNodes);
          set({ nodes: updatedNodes });

          // Focus on the first new node
          if (newNodes.length > 0) {
            get().focusNodeTextarea(newNodes[0].id, "end");
          }
        } else {
          console.log("Failed to insert nodes");
        }
      },

      handlePaste: (
        e: React.ClipboardEvent<HTMLTextAreaElement>,
        nodeId: string
      ) => {
        const pastedText = e.clipboardData.getData("text");
        const {
          handleNodeUpdate,
          getNodeById,
          parseAndInsertStructuredText,
          addNodeAfter,
        } = get();
        const node = getNodeById(nodeId);
        if (!node) return;

        // Check if the pasted text contains multiple lines
        const lines = pastedText
          .split("\n")
          .filter((line) => line.trim() !== "");
        console.log("lines", lines);
        console.log("lines.length", lines.length);

        // Check if it's structured content (bullets, numbers, indentation)
        const hasStructuredContent =
          lines.length > 1 &&
          lines.some((line) => {
            const hasBullet = line.match(/^\s*[-*+]\s/);
            const hasNumber = line.match(/^\s*\d+\.\s/);
            const hasIndent = line.match(/^\s{2,}/);
            console.log(
              `Line: "${line}" | Bullet: ${!!hasBullet} | Number: ${!!hasNumber} | Indent: ${!!hasIndent}`
            );
            return hasBullet || hasNumber || hasIndent;
          });

        // Check if it's simple multi-line text (no structure but multiple lines)
        const isMultiLineText = lines.length > 1 && !hasStructuredContent;

        console.log("hasStructuredContent", hasStructuredContent);
        console.log("isMultiLineText", isMultiLineText);

        if (hasStructuredContent) {
          e.preventDefault();
          console.log(
            "Preventing default and calling parseAndInsertStructuredText for structured content"
          );

          // Clear current node content if it's empty, then insert all structured content
          if (node.content.trim() === "") {
            handleNodeUpdate(node.id, { content: "" });
            // Insert all content as siblings after the current empty node
            parseAndInsertStructuredText(pastedText, node.id, true, false);
          } else {
            // Insert all content as siblings after the current node
            parseAndInsertStructuredText(pastedText, node.id, true, false);
          }
        } else if (isMultiLineText) {
          e.preventDefault();
          console.log(
            "Preventing default and creating separate nodes for multi-line text"
          );

          // Update current node with first line
          handleNodeUpdate(node.id, { content: lines[0] });

          // Create separate nodes for remaining lines
          const remainingLines = lines.slice(1);
          let currentNodeId = node.id;

          for (const line of remainingLines) {
            // Add each line as a new sibling node after the current one
            const newNodeId = addNodeAfter(currentNodeId, line);
            if (newNodeId) {
              currentNodeId = newNodeId;
            }
          }
        } else {
          console.log("Single line or normal paste, allowing default behavior");
        }
      },

      // Selection methods
      startSelection: (nodeId: string) => {
        console.log("Starting selection from node:", nodeId);

        // First clear existing selections to avoid stale state
        get().clearSelection();

        // Then set new selection state
        set({
          isSelecting: true,
          selectionStartNodeId: nodeId,
          selectedNodeIds: [nodeId],
        });

        // Mark the node as selected in its metadata
        get().updateNodeSelection(nodeId, true);
      },

      updateSelection: (nodeId: string) => {
        const { selectionStartNodeId, isSelecting } = get();
        console.log("Updating selection", {
          nodeId,
          selectionStartNodeId,
          isSelecting,
        });

        if (!isSelecting || !selectionStartNodeId) {
          console.log(
            "Not updating selection: not in selecting mode or no start node"
          );
          return;
        }

        // Get flattened nodes to determine range
        const flattenedNodes = get().getAllNodesFlattened();
        console.log("Flattened nodes count:", flattenedNodes.length);

        const startIndex = flattenedNodes.findIndex(
          (n) => n.id === selectionStartNodeId
        );
        const endIndex = flattenedNodes.findIndex((n) => n.id === nodeId);
        console.log("Selection indices:", { startIndex, endIndex });

        if (startIndex === -1 || endIndex === -1) {
          console.log("Selection indices not found");
          return;
        }

        // Clear all selections first
        get().clearSelection();

        // Select range between start and end (inclusive)
        const minIndex = Math.min(startIndex, endIndex);
        const maxIndex = Math.max(startIndex, endIndex);
        console.log("Selection range:", { minIndex, maxIndex });

        // Build selected IDs list and update node metadata
        const selectedIds: string[] = [];
        for (let i = minIndex; i <= maxIndex; i++) {
          const node = flattenedNodes[i];
          selectedIds.push(node.id);
        }

        // Update the store's selectedNodeIds state
        set({ selectedNodeIds: selectedIds });

        // Now update node metadata for all selected nodes
        selectedIds.forEach((id) => {
          get().updateNodeSelection(id, true);
        });

        console.log("Selected nodes:", selectedIds);
      },

      endSelection: () => {
        console.log("Ending selection");
        set({
          isSelecting: false,
          selectionStartNodeId: null,
        });
      },

      clearSelection: () => {
        const { nodes } = get();
        const updatedNodes = JSON.parse(
          JSON.stringify(nodes)
        ) as OutlinerNode[];

        const clearNodeSelection = (nodes: OutlinerNode[]): void => {
          for (let node of nodes) {
            node.meta_data.isSelected = false;
            if (node.children.length > 0) {
              clearNodeSelection(node.children);
            }
          }
        };

        clearNodeSelection(updatedNodes);
        set({
          nodes: updatedNodes,
          selectedNodeIds: [],
        });
      },

      updateNodeSelection: (nodeId: string, isSelected: boolean) => {
        const { nodes } = get();
        const updatedNodes = JSON.parse(
          JSON.stringify(nodes)
        ) as OutlinerNode[];

        const updateNode = (
          nodes: OutlinerNode[],
          id: string,
          selected: boolean
        ): boolean => {
          for (let node of nodes) {
            if (node.id === id) {
              node.meta_data.isSelected = selected;
              return true;
            }
            if (node.children.length > 0) {
              const updated = updateNode(node.children, id, selected);
              if (updated) return true;
            }
          }
          return false;
        };

        updateNode(updatedNodes, nodeId, isSelected);
        set({ nodes: updatedNodes });
      },

      isNodeSelected: (nodeId: string) => {
        const { selectedNodeIds } = get();
        return selectedNodeIds.includes(nodeId);
      },

      getSelectedNodes: () => {
        const { selectedNodeIds } = get();
        const flattenedNodes = get().getAllNodesFlattened();
        return flattenedNodes.filter((n) => selectedNodeIds.includes(n.id));
      },

      deleteSelectedNodes: () => {
        const { selectedNodeIds } = get();
        if (selectedNodeIds.length === 0) return;

        const { nodes } = get();
        const updatedNodes = JSON.parse(
          JSON.stringify(nodes)
        ) as OutlinerNode[];

        const deleteNodes = (nodes: OutlinerNode[]): OutlinerNode[] => {
          return nodes.filter((node) => {
            if (selectedNodeIds.includes(node.id)) {
              return false; // Remove this node
            }

            if (node.children.length > 0) {
              node.children = deleteNodes(node.children);
            }

            return true;
          });
        };

        const topNodeId = selectedNodeIds[0];
        const topNode = get().getNodeById(topNodeId);
        console.log("topNodeId", topNode);

        const filteredNodes = deleteNodes(updatedNodes);
        set({
          nodes: filteredNodes,
          selectedNodeIds: [],
          selectionStartNodeId: null,
          isSelecting: false,
        });
        const previousNode = get().findPreviousNodeInHierarchy(topNodeId);
        console.log("previousNode:", previousNode);
        if (previousNode) {
          get().focusNodeTextarea(previousNode.id, "end");
        }
      },

      // Future API methods
      fetchNodes: async () => {
        // TODO: Implement API call to fetch nodes
        console.log("fetchNodes: Not implemented yet");
      },

      saveNodes: async () => {
        // TODO: Implement API call to save nodes
        console.log("saveNodes: Not implemented yet");
      },
    }),
    {
      name: "outliner",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        // Set loading to false once rehydration is complete
        if (state) {
          state.setIsLoading(false);
        }
      },
    }
  )
);

export default useOutlinerStore;
