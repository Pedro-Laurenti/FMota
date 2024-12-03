"use client";
import "@/styles/globals.css";
import NextLink from "next/link";
import { Logo } from "@/components/icons";
import { NavbarCheckout, NavbarLogin, NavbarDash } from "@/components/navbar";
import { Link } from "@nextui-org/react";
import { siteConfig } from "@/config/site";
import { IoLogoInstagram, IoLogoTwitch, IoLogoWhatsapp, IoLogoYoutube } from "react-icons/io5";
import { Footer } from "@/components/footer";

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
      <Footer />
    </div>
  );
}