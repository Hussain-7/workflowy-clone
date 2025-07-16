import React from "react";
import Content from "~/components/Content";
import Header from "~/components/Header";
import type { Route } from "./+types";

export function meta({ params }: Route.MetaArgs) {
  return [
    { title: "Workflowy Clone" },
    { name: "description", content: "New Document!" },
  ];
}

type Props = {
  params: {
    id: string;
  };
};

const OutlinerPageWrapper = ({ params }: Route.ComponentProps) => {
  const { id } = params;
  console.log("Document ID from route params:", id);
  return (
    <div className="w-full flex flex-col items-center justify-start min-h-[calc(100vh-50px)] bg-white">
      <Content documentId={id} />
    </div>
  );
};

export default OutlinerPageWrapper;
