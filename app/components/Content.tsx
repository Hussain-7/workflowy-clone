import { useNavigation } from "react-router";
import OutlinePage from "./outliner/OutlinerPage";
import { mainDocuments } from "~/constants/data";

type Props = {
  documentId: string;
};

const Content = ({ documentId }: Props) => {
  return (
    <div className="px-4 py-6 w-[90vw] md:w-[700px] my-10 mx-auto bg-white!">
      {/* Pass the id of node to show the title of that node and which root node id */}
      <OutlinePage
        nodeId={documentId}
      />
    </div>
  );
};

export default Content;
