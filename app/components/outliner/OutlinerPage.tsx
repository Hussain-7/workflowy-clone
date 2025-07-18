import useOutliner from "@/hooks/use-outliner";
import OutlinerItem from "./OutlinerItem";
import { GoPlus } from "react-icons/go";
import { FiPlus } from "react-icons/fi";
import AddItemButton from "./AddItemButton";

type Props = {
  nodeId?: string;
};

const OutlinePage = ({ nodeId }: Props) => {
  // Can be fetched from the db

  const { nodes, nodeTitle, handleEdit, handleKeyDown, handleAddChild } =
    useOutliner(nodeId);

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
      <div className="outliner border-0 py-4 bg-white h-fit">
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
                onEdit={handleEdit}
                onKeyDown={handleKeyDown}
                level={0}
                isLastNode={index === nodes.length - 1}
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
