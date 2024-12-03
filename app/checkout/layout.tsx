// app/about/layout.tsx
import "@/styles/globals.css";
import { LayoutCheckout } from "../layoutsBib";

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <LayoutCheckout>
      {children}
    </LayoutCheckout>
  );
}