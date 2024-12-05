"use client";
import "@/styles/globals.css";
import { NavbarCheckout, NavbarLogin, NavbarDash, NavbarAdmin } from "@/components/navbar";
import { Button } from "@nextui-org/react";
import { IoMenu } from "react-icons/io5";
import { Footer, FooterAdmin } from "@/components/footer";
import { useEffect, useState } from "react";
import { VersionToggle } from "@/components/version";

export function LayoutLogoff({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <NavbarLogin />
      <div className="flex-grow">
        {children}
      </div>
      <VersionToggle />
      <Footer />
    </div>
  );
}

export function LayoutCheckout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <NavbarCheckout />
      <div className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
        {children}
      </div>
      <VersionToggle />
      <Footer />
    </div>
  );
}

export function LayoutDash({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <NavbarDash />
      <div className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
        {children}
      </div>
      <VersionToggle />
      <Footer />
    </div>
  );
}

export function LayoutAdmin({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="min-h-screen flex w-screen overflow-x-hidden">
      {/* Menu lateral */}
      <aside
        className={`h-full bg-default-50/50 border-r border-default-200 fixed transition-transform duration-300 ${
          isOpen ? "translate-x-0 w-full md:w-64" : "-translate-x-full w-64"
        }`}
      >
        <Button
          isIconOnly
          className={`absolute md:hidden top-4 right-4 z-10 bg-default-50/50 p-2 rounded-md transition-transform duration-300`}
          onClick={() => setIsOpen((prev) => !prev)}
        >
          {isOpen ? <IoMenu className="text-xl" /> : <IoMenu className="rotate-90 text-xl" />}
        </Button>
        <NavbarAdmin />
      </aside>

      {/* Conteúdo principal */}
      <div
        className={`flex flex-col w-full transition-all duration-300 ${
          isOpen ? "ml-[100vw] md:ml-64" : "ml-0"
        }`}
      >
        <div>
          <Button
            isIconOnly
            className={`fixed top-4 z-10 bg-default-50/50 p-2 rounded-md transition-transform duration-300`}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? <IoMenu className="text-xl" /> : <IoMenu className="rotate-90 text-xl" />}
          </Button>
        </div>
        <div className="flex-grow w-full flex overflow-y-auto px-12 py-5">
          <div className="w-full">{children}
          </div>
        </div>
        {/* Rodapé */}
        <FooterAdmin />
      </div>
    </div>
  );
}

