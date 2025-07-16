import React from "react";
import OutlinerItem from "@/components/outliner/OutlinerItem";
import useOutliner from "@/hooks/use-outliner";

type Props = {
  id: string;
  title: string;
};

const OutlinerPage = ({ id, title }: Props) => {
  const {
    nodes,
    handleAddChild,
    handleDelete,
    handleEdit,
    handleToggleEdit,
    handleKeyDown,
  } = useOutliner();

  return (
    <>
      <h1 className="text-2xl font-bold text-black">Outliner</h1>
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
    </>
  );
};

export default OutlinerPage;
