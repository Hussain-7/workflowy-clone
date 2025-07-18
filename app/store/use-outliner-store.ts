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
  };
}

interface OutlinerStore {
  // State
  // overall data
  nodes: OutlinerNode[];
  selectedNodeId: string | null;
  isLoading: boolean;
  // Current Focused node

  // Basic operations
  setNodes: (nodes: OutlinerNode[]) => void;
  setSelectedNodeId: (id: string | null) => void;
  setIsLoading: (loading: boolean) => void;
  initializeNodes: (defaultNodes: OutlinerNode[]) => void;

  // Utility methods
  getAllNodesFlattened: () => OutlinerNode[];
  getNodeById: (id: string) => OutlinerNode | null;
  findNode: (id: string) => [OutlinerNode | null, OutlinerNode | null, number];
  findPreviousNode: (nodeId: string) => OutlinerNode | null;
  findPreviousNodeInHierarchy: (nodeId: string) => OutlinerNode | null;
  findNextNodeInHierarchy: (nodeId: string) => OutlinerNode | null;
  findDeepestLastChild: (node: OutlinerNode) => OutlinerNode;

  // Node manipulation methods
  handleEdit: (id: string, content: string) => void;
  handleDelete: (id: string) => void;
  addNodeAfter: (afterId: string | null, content?: string) => string | null;
  addNodeBefore: (beforeId: string, content?: string) => string | null;
  handleAddChild: (parentId: string | null) => void;
  indentNode: (nodeId: string | null) => void;
  unIndentNode: (nodeId: string | null) => boolean;

  // Keyboard handling methods
  handleEnterKey: (
    nodeId: string,
    cursorPosition: number,
    nodeContent: string
  ) => void;
  handleBackspaceKey: (
    nodeId: string,
    cursorPosition: number,
    nodeContent: string
  ) => void;
  handleTabKey: (nodeId: string) => void;
  handleShiftTabKey: (nodeId: string) => void;
  handleArrowUp: (nodeId: string, cursorPosition: number) => void;
  handleArrowDown: (
    nodeId: string,
    cursorPosition: number,
    textLength: number
  ) => void;

  // Helper methods
  focusNodeTextarea: (nodeId: string, cursorPosition?: "start" | "end") => void;
  generateNodeId: () => string;

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
      isLoading: true,

      // Basic operations
      setNodes: (nodes) => set({ nodes }),
      setSelectedNodeId: (id) => set({ selectedNodeId: id }),
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

      findNode: (id: string) => {
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

      findPreviousNode: (nodeId: string) => {
        const flattenedNodes = get().getAllNodesFlattened();
        const currentIndex = flattenedNodes.findIndex(
          (node) => node.id === nodeId
        );

        if (currentIndex > 0) {
          return flattenedNodes[currentIndex - 1];
        }

        return null;
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

      // Node manipulation methods
      handleEdit: (id: string, content: string) => {
        const { nodes } = get();

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
            isExpanded: false,
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
            isExpanded: false,
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
            isExpanded: false,
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
            setTimeout(() => {
              focusNodeTextarea(nodeId);
            }, 0);
          }
          return success;
        }

        return false;
      },

      // Keyboard handling methods
      handleEnterKey: (
        nodeId: string,
        cursorPosition: number,
        nodeContent: string
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
        if (!currentNode) return;

        // Special case: If node is empty, and not at root level, unindent it
        if (nodeContent.trim() === "") {
          const status = unIndentNode(nodeId);
          if (!status) {
            const newNodeId = addNodeAfter(nodeId, "");
            if (newNodeId) {
              setTimeout(() => focusNodeTextarea(newNodeId), 0);
            }
          }
          return;
        }

        // Case 1: Cursor at beginning - add node above
        if (cursorPosition === 0) {
          const newNodeId = addNodeBefore(nodeId, "");
          if (newNodeId) {
            setTimeout(() => focusNodeTextarea(newNodeId), 0);
          }
        }
        // Case 2: Cursor at the end - add node after
        else if (cursorPosition === nodeContent.length) {
          const newNodeId = addNodeAfter(nodeId, "");
          if (newNodeId) {
            setTimeout(() => focusNodeTextarea(newNodeId), 0);
          }
        }
        // Case 3: Cursor in the middle - split content
        else {
          const leftContent = nodeContent.substring(0, cursorPosition);
          const rightContent = nodeContent.substring(cursorPosition);

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
              isExpanded: false,
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
          setTimeout(() => focusNodeTextarea(newNodeId), 0);
        }
      },

      handleBackspaceKey: (
        nodeId: string,
        cursorPosition: number,
        nodeContent: string
      ) => {
        const {
          nodes,
          findNode,
          handleDelete,
          findPreviousNode,
          focusNodeTextarea,
        } = get();
        const [currentNode] = findNode(nodeId);

        if (currentNode && nodeContent === "" && cursorPosition === 0) {
          handleDelete(nodeId);

          const previousNode = findPreviousNode(nodeId);
          if (previousNode) {
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

      handleTabKey: (nodeId: string) => {
        get().indentNode(nodeId);
      },

      handleShiftTabKey: (nodeId: string) => {
        get().unIndentNode(nodeId);
      },

      handleArrowUp: (nodeId: string, cursorPosition: number) => {
        if (cursorPosition === 0) {
          const { findPreviousNodeInHierarchy, focusNodeTextarea } = get();
          const previousNode = findPreviousNodeInHierarchy(nodeId);

          if (previousNode) {
            focusNodeTextarea(previousNode.id, "start");
          }
        }
      },

      handleArrowDown: (
        nodeId: string,
        cursorPosition: number,
        textLength: number
      ) => {
        if (cursorPosition === textLength) {
          const { findNextNodeInHierarchy, focusNodeTextarea } = get();
          const nextNode = findNextNodeInHierarchy(nodeId);

          if (nextNode) {
            focusNodeTextarea(nextNode.id, "start");
          }
        }
      },

      // Helper methods
      focusNodeTextarea: (
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
      },

      generateNodeId: () => `node_${nanoid()}`,

      // Future API methods (placeholders)
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
