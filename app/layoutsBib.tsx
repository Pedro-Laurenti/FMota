"use client";
import "@/styles/globals.css";
import NextLink from "next/link";
import { Logo } from "@/components/icons";
import { NavbarCheckout, NavbarLogin, NavbarDash } from "@/components/navbar";
import { Link } from "@nextui-org/react";
import { siteConfig } from "@/config/site";
import { IoLogoInstagram, IoLogoTwitch, IoLogoWhatsapp, IoLogoYoutube } from "react-icons/io5";

export function LayoutLogoff({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      <NavbarLogin />
      <div className="container mx-auto max-w-7xl pt-16 px-6 flex-grow">
        {children}
      </div>
      <div className="w-full flex items-center justify-around py-3">
        <NextLink className="flex justify-start items-center gap-1" href="/">
          <Logo size={20} className="mr-2" />
          <p className="font-bold text-xs text-content1-foreground">Mentoria Integração Transdiciplinar</p>
        </NextLink>
        <div className="flex gap-2">
          <Link isExternal aria-label="Twitter" href={siteConfig.links.youtube}>
            <IoLogoYoutube className="text-default-500" />
          </Link>
          <Link isExternal aria-label="Twitter" href={siteConfig.links.whatsapp}>
            <IoLogoWhatsapp className="text-default-500" />
          </Link>
          <Link isExternal aria-label="Twitter" href={siteConfig.links.whatsapp}>
            <IoLogoInstagram className="text-default-500" />
          </Link>
        </div>
      </div>
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
      <div className="w-full flex items-center justify-around py-3">
        <NextLink className="flex justify-start items-center gap-1" href="/">
          <Logo size={20} className="mr-2" />
          <p className="font-bold text-xs text-content1-foreground">Mentoria Integração Transdiciplinar</p>
        </NextLink>
        <div className="flex gap-2">
          <Link isExternal aria-label="Twitter" href={siteConfig.links.youtube}>
            <IoLogoYoutube className="text-default-500" />
          </Link>
          <Link isExternal aria-label="Twitter" href={siteConfig.links.whatsapp}>
            <IoLogoWhatsapp className="text-default-500" />
          </Link>
          <Link isExternal aria-label="Twitter" href={siteConfig.links.whatsapp}>
            <IoLogoInstagram className="text-default-500" />
          </Link>
        </div>
      </div>
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
      <div className="w-full flex items-center justify-around py-3">
        <NextLink className="flex justify-start items-center gap-1" href="/">
          <Logo size={20} className="mr-2" />
          <p className="font-bold text-xs text-content1-foreground">Mentoria Integração Transdiciplinar</p>
        </NextLink>
        <div className="flex gap-2">
          <Link isExternal aria-label="Twitter" href={siteConfig.links.youtube}>
            <IoLogoYoutube className="text-default-500" />
          </Link>
          <Link isExternal aria-label="Twitter" href={siteConfig.links.whatsapp}>
            <IoLogoWhatsapp className="text-default-500" />
          </Link>
          <Link isExternal aria-label="Twitter" href={siteConfig.links.whatsapp}>
            <IoLogoInstagram className="text-default-500" />
          </Link>
        </div>
      </div>
    </div>
  );
}