"use client";

import { useState } from "react";
import { IoPlanet } from "react-icons/io5";
import config from '../package.json';
import { Link } from "@nextui-org/react";

export const VersionToggle = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div
      className="fixed bottom-5 left-5 flex flex-row items-center p-1 rounded-full dark:bg-black/30 bg-white/10 "
      onMouseEnter={handleMenuToggle}
      onMouseLeave={handleMenuToggle}
    >
      <IoPlanet className="text-xl" />
      <div
        className={`flex items-center gap-5 transition-all duration-300 ease-in-out transform ${
          menuOpen ? "opacity-100" : "opacity-0"
        }`}
      >
        {menuOpen && (
          <Link
            href="https://orbyte.com.br"
            target="_blank"
            className="mx-2 text-tiny text-default-500"
          >
              v. {config.version}
          </Link>
        )}
      </div>
    </div>
  );
};
