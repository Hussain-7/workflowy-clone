import React, { useEffect, useRef } from "react";
import useOutliner from "@/hooks/use-outliner";
import OutlinerItem from "./OutlinerItem";
import AddItemButton from "./AddItemButton";
import useOutlinerStore from "~/store/use-outliner-store";

type Props = {
  nodeId?: string;
};

const OutlinePage = ({ nodeId }: Props) => {
  const {
    endSelection,
    startSelection,
    updateSelection,
    isSelecting,
    handlePaste,
    isNodeSelected,
  } = useOutlinerStore();
  
  const outlineRef = useRef<HTMLDivElement>(null);

  // Global mouse handlers to ensure selection works properly
  useEffect(() => {
    const handleGlobalMouseDown = (e: MouseEvent) => {
      // If clicking outside any outliner item, and not on a button
      const nodeId = (e.target as HTMLElement).getAttribute("data-node-id");
      if (nodeId) {
        startSelection(nodeId);
      }
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isSelecting || !outlineRef.current) return;

      // Get mouse position relative to the outliner container
      const rect = outlineRef.current.getBoundingClientRect();
      const mouseY = e.clientY - rect.top;

      // Get all node elements in the DOM and convert to array
      const nodeElements = Array.from(
        outlineRef.current.querySelectorAll<HTMLElement>("[data-node-id]")
      );

      // Find the node that the mouse is closest to vertically
      let closestNode: HTMLElement | null = null;
      let closestDistance = Infinity;

      nodeElements.forEach((element) => {
        const elementRect = element.getBoundingClientRect();
        // Calculate distance from mouse to element center
        const elementCenterY =
          elementRect.top + elementRect.height / 2 - rect.top;
        const distance = Math.abs(mouseY - elementCenterY);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestNode = element;
        }
      });

      // If found a closest node, update selection
      if (closestNode) {
        const nodeId = (closestNode as HTMLElement)?.getAttribute(
          "data-node-id"
        );
        if (nodeId) {
          updateSelection(nodeId);
        }
      }
    };

    const handleGlobalMouseUp = () => {
      // Always end selection on mouse up anywhere in the document
      console.log("Global mouse up, ending selection");
      endSelection();
    };

    // Track mouse movement globally for smooth selection
    document.addEventListener("mousedown", handleGlobalMouseDown);
    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousedown", handleGlobalMouseDown);
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [endSelection, startSelection, updateSelection, isSelecting]);

  // Can be fetched from the db

  const {
    nodes,
    nodeTitle,
    handleKeyDown,
    handleAddChild,
    handleNodeUpdate,
    multipleSelected,
  } = useOutliner(nodeId);

  return (
    <div className="px-4 py-6 w-[90vw] md:w-[700px] my-10 mx-auto bg-white!">
      {nodeId && (
        <h1 className="text-2xl font-bold text-black">
          {nodeTitle ? (
            nodeTitle
          ) : (
            <div className="text-gray-600">Untitled</div>
          )}
        </h1>
      )}
      <div className="outliner border-0 py-4 bg-white h-fit" ref={outlineRef}>
        {nodes.length === 0 ? (
          <AddItemButton
            handleAddChild={() => handleAddChild(nodeId || null)}
          />
        ) : (
          <>
            {nodes.map((node, index) => (
              <OutlinerItem
                key={node.id}
                node={node}
                onNodeUpdate={handleNodeUpdate}
                onKeyDown={handleKeyDown}
                level={0}
                isLastNode={index === nodes.length - 1}
                multipleSelected={multipleSelected}
                isNodeSelected={isNodeSelected}
                handlePaste={handlePaste}
              />
            ))}
            <AddItemButton
              handleAddChild={() => handleAddChild(nodeId || null)}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default OutlinePage;
