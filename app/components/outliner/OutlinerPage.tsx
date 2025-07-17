import useOutliner, { type OutlinerNode } from "@/hooks/use-outliner";
import { mainDocuments } from "@/constants/data";
import OutlinerItem from "./OutlinerItem";
import { useEffect } from "react";
import { getAllNodesFlattened } from "@/lib/outliner-helper";
import { redirect } from "react-router";
import useOutlinerStore from "~/store/use-outliner-store";

type Props = {
  nodeId?: string;
};

const OutlinePage = ({ nodeId }: Props) => {
  // Can be fetched from the db
  const { getAllNodesFlattened } = useOutlinerStore();
  const flattenedData = getAllNodesFlattened();
  let nodeSelected: OutlinerNode | undefined;
  if (nodeId) {
    nodeSelected = flattenedData.find(
      (doc) => doc.id === nodeId
    ) as OutlinerNode;
  }

  const dataNodes = nodeId ? nodeSelected?.children : mainDocuments;
  const { nodes, handleEdit, handleKeyDown } = useOutliner(dataNodes || []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  if (nodeId && !nodeSelected) {
    redirect("/");
  }

  return (
    <div className="px-4 py-6 w-[90vw] md:w-[700px] my-10 mx-auto bg-white!">
      {nodeId && (
        <h1 className="text-2xl font-bold text-black">
          {nodeSelected?.content || ""}
        </h1>
      )}
      <div className="outliner border-0 py-4 bg-white h-fit">
        {nodes.length === 0 ? (
          <div className="text-gray-500 italic">Loading content...</div>
        ) : (
          nodes.map((node, index) => (
            <OutlinerItem
              key={node.id}
              node={node}
              onEdit={handleEdit}
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

export default OutlinePage;
