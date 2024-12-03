"use client";
import { Link, Button } from "@nextui-org/react";
import { LayoutLogoff } from "./layoutsBib";

export default function Home() {
  return (
    <LayoutLogoff>
      <section className="flex items-center justify-center gap-4 py-8 md:py-10">
        <Button color="default">Default</Button>
        <Button color="primary">Primary</Button>
        <Button color="secondary">Secondary</Button>
        <Button color="success">Success</Button>
        <Button color="warning">Warning</Button>
        <Button color="danger">Danger</Button>
        <Link href="/signin">Login</Link>
      </section>
    </LayoutLogoff>
  );
}
