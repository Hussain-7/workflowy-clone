import type { Route } from "./+types/index";
import OutlinePage from "~/components/outliner/OutlinerPage";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Workflowy Clone" },
    { name: "description", content: "Home Page!" },
  ];
}

export default function HomePage() {
  return <OutlinePage />;
}
