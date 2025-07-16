import useOutliner, { getAllNodesFlattened, type OutlinerNode } from "@/hooks/use-outliner";
import { mainDocuments } from "~/constants/data";
import OutlinerItem from "./OutlinerItem";

type Props = {
  nodeId: string;
  rootId?: string;
};

const OutlinePage = ({ nodeId, rootId }: Props) => {
  // Can be fetched from the db
  const flattenedData = getAllNodesFlattened(mainDocuments)
  const nodeSelected = flattenedData.find(
    (doc) => doc.id === nodeId
  ) as OutlinerNode; 
  const {
    nodes,
    handleAddChild,
    handleDelete,
    handleEdit,
    handleToggleEdit,
    handleKeyDown,
  } = useOutliner(nodeSelected?.children || []);

  return (
    <>
      <h1 className="text-2xl font-bold text-black">{nodeSelected?.content || ""}</h1>
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
    </>
  );
};

export default OutlinePage;
