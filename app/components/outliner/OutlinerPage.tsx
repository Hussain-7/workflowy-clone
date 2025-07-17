import useOutliner, {
  getAllNodesFlattened,
  type OutlinerNode,
} from "@/hooks/use-outliner";
import { mainDocuments } from "~/constants/data";
import OutlinerItem from "./OutlinerItem";
import { useEffect } from "react";

type Props = {
  nodeId?: string;
};

const OutlinePage = ({ nodeId }: Props) => {
  // Can be fetched from the db
  const flattenedData = getAllNodesFlattened(mainDocuments);
  let nodeSelected: OutlinerNode | undefined;
  if (nodeId) {
    nodeSelected = flattenedData.find(
      (doc) => doc.id === nodeId
    ) as OutlinerNode;
  }
  const dataNodes = nodeId ? nodeSelected?.children : mainDocuments;
  const {
    nodes,
    handleAddChild,
    handleDelete,
    handleEdit,
    handleToggleEdit,
    handleKeyDown,
  } = useOutliner(dataNodes || []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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
              onAddChild={handleAddChild}
              onDelete={handleDelete}
              onEdit={handleEdit}
              onToggleEdit={handleToggleEdit}
              onKeyDown={handleKeyDown}
              level={0}
              isLastNode={index === nodes.length - 1}
              showMain={false}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default OutlinePage;
