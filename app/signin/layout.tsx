// app/about/layout.tsx
import "@/styles/globals.css";
import { LayoutLogoff } from "../layoutsBib";

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutLogoff>
      {children}
    </LayoutLogoff>
  );
}