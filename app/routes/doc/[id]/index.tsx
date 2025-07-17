import type { Route } from "./+types";
import OutlinePage from "~/components/outliner/OutlinerPage";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: "Workflowy Clone - Home" },
    { name: "description", content: "Home Page!" },
  ];
}

type Props = {
  params: {
    id: string;
  };
};

const OutlinerPageWrapper = ({ params }: Route.ComponentProps) => {
  const { id } = params;
  return <OutlinePage nodeId={id} />;
};

export default OutlinerPageWrapper;
