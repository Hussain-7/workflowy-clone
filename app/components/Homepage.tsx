import { mainDocuments } from "~/constants/data";
import OutlinerItem from "@/components/outliner/OutlinerItem";

type Props = {};

const Homepage = (props: Props) => {
  return (
    <div className="w-full flex flex-col items-center justify-start min-h-[calc(100vh-50px)] bg-white">
      <div className="px-4 py-6 w-[90vw] md:w-[700px] my-20 mx-auto bg-white!">
        {mainDocuments.map((doc) => (
          <OutlinerItem
            key={doc.id}
            node={doc}
            onAddChild={() => {}}
            onDelete={() => {}}
            onEdit={() => {}}
            onToggleEdit={() => {}}
            onKeyDown={() => {}}
            level={0}
            isLastNode={true}
            showMain={true}
          />
        ))}
      </div>
    </div>
  );
};

export default Homepage;
