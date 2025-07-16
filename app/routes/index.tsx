import Homepage from "~/components/Homepage";
import type { Route } from "./+types/index";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Workflowy Clone" },
    { name: "description", content: "Home Page!" },
  ];
}

export default function HomePage() {
  return <Homepage />;
}
