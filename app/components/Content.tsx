import OutlinerPage from "./outliner/OutlinerPage";

type Props = {};

const Content = (props: Props) => {
  return (
    <div className="px-4 py-6 w-[90vw] md:w-[700px] mt-10 mx-auto">
      <OutlinerPage />
    </div>
  );
};

export default Content;
