import { useNavigation } from "react-router";
import OutlinePage from "./outliner/OutlinerPage";

type Props = {};



const Content = (props: Props) => {
  const { location } = useNavigation();
  console.log("Location", location);
  return (
    <div className="px-4 py-6 w-[90vw] md:w-[700px] mt-10 mx-auto">
      {/* Pass the id of node to show the title of that node and which root node id */}
      <OutlinePage nodeId="outliner" title="Outliner" rootId="outliner1"/>
    </div>
  );
};

export default Content;
