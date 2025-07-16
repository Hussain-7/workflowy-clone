import { useNavigation } from "react-router";
import OutlinerPage from "./outliner/OutlinerPage";

type Props = {};



const Content = (props: Props) => {
  const { location } = useNavigation();
  console.log("Location", location);
  return (
    <div className="px-4 py-6 w-[90vw] md:w-[700px] mt-10 mx-auto">
      <OutlinerPage id="outliner" title="Outliner" />
    </div>
  );
};

export default Content;
