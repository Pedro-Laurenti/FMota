import { Spinner } from "@nextui-org/react";
import React, { Suspense } from "react";

export default function Page({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<Spinner />}>
      {children}
    </Suspense>
  );
}
