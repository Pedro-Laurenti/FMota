import React from "react";
import { Logo } from "@/components/icons";
import { Link } from "@nextui-org/react";
import { IoLogoInstagram, IoLogoTwitch, IoLogoWhatsapp, IoLogoYoutube } from "react-icons/io5";
import { siteConfig } from "@/config/site";
import config from '../package.json';

export function Footer() {
  return (
    <footer className="w-full py-6 border-t border-default-300">
      <div className="container mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4 px-6">
        {/* Direitos autorais */}
        <p className="text-xs text-default-500 text-center">
          © {new Date().getFullYear()} Mentoria Integração Transdisciplinar. Todos os direitos reservados.
        </p>

        {/* Links para redes sociais */}
        <div className="flex gap-4">
          <Logo size={24} className="mr-2" />
          <Link isExternal aria-label="YouTube" href={siteConfig.links.youtube}>
            <IoLogoYoutube className="" size={24} />
          </Link>
          <Link isExternal aria-label="WhatsApp" href={siteConfig.links.whatsapp}>
            <IoLogoWhatsapp className="" size={24} />
          </Link>
          <Link isExternal aria-label="Instagram" href={siteConfig.links.instagram}>
            <IoLogoInstagram className="" size={24} />
          </Link>
        </div>

      </div>
    </footer>
  );
}


export function FooterAdmin() {
  return (
    <footer className="w-full py-2 border-t border-default-300">
      <div className="container mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-default-500 text-center">
          © {new Date().getFullYear()} Mentoria Integração Transdisciplinar. Todos os direitos reservados.
        </p>
        <p className="text-xs text-default-500 text-center">
          v. {config.version}
        </p>
      </div>
    </footer>
  );
}

