export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Filipe Mota",
  description: "Mentoria Integração Transdisciplinar",
  navItems: [
    {
      label: "Início",
      href: "/",
    },
    {
      label: "Entrar",
      href: "/signin",
    },
  ],
  navItemsCheckout: [
    {
      label: "Início",
      href: "/checkout",
    },
    {
      label: "Sair",
      href: "/",
    },
  ],
  navMenuItems: [
    {
      label: "Início",
      href: "/",
    },
    {
      label: "Entrar",
      href: "/signin",
    },
  ],
  navMenuItemsCheckout: [
    {
      label: "Início",
      href: "/checkout",
    },
    {
      label: "Sair",
      href: "/",
    },
  ],
  links: {
    instagram: "https://Instagram.com/felipemoraesmota_",
    youtube:  "https://www.youtube.com/@therapieslovekids",
    whatsapp: "https://wa.me/+5562992898929",
  },
};
