import type { Route } from "./+types/test";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function TestPage() {
  return <div>Test Page</div>;
}
