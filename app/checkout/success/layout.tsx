import React, { Suspense } from "react";

export default function Page({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<p>Carregando...</p>}>
      {children}
    </Suspense>
  );
}
