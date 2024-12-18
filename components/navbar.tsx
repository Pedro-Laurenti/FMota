import {
  Navbar as NextUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@nextui-org/react";
import { Link } from "@nextui-org/react";
import NextLink from "next/link";
import { ThemeSwitch } from "@/components/theme-switch";
import { Logo } from "@/components/icons";
import { IoClose, IoMenu, IoLogOut, IoPerson, IoHome, IoSettings, IoExit } from "react-icons/io5";
import { useEffect, useState } from "react";
import { MdOutlineExitToApp } from "react-icons/md";

export const NavbarLogin = () => {

  return (
    <NextUINavbar maxWidth="xl" position="sticky" className="border-b border-b-default-200 backdrop-blur-sm">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
        </NavbarItem>
        <NextLink
          className="hidden sm:flex gap-2"
          href="/signin"
        >
          <IoPerson className="text-default-500 transition-colors hover:text-default-400" />
        </NextLink>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
            <NavbarMenuItem key="1">
              <Link
                color="primary"
                href="/signin"
                size="lg"
              >
                <IoPerson className="text-2xl mr-2" />
                Entrar
              </Link>
            </NavbarMenuItem>

            <NavbarMenuItem key="2">
              <Link
                color="primary"
                href="/signin"
                size="lg"
              >
                <IoHome className="text-2xl mr-2" />
                Início
              </Link>
            </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};

export const NavbarCheckout = () => {
  const handleExit = async () => {
    try {
      const response = await fetch("/api/auth/signout", { method: "POST" });

      if (response.ok) {
        window.location.href = "/"; // Redireciona para a página inicial
      } else {
        console.error("Erro ao realizar logout");
      }
    } catch (error) {
      console.error("Erro ao desconectar:", error);
    }
  };

  return (
    <NextUINavbar maxWidth="xl" position="sticky" className="border-b border-b-default-200 backdrop-blur-sm">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/">
            <Logo />
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <ThemeSwitch />
          <Link
            className="hover:cursor-pointer"
            key="logout"
            color="danger"
            onClick={handleExit}
          >
            <IoLogOut className="text-2xl mr-2" />
          </Link>
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <ThemeSwitch />

        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
            <NavbarMenuItem key="10">
              <Link
                className="hover:cursor-pointer"
                key="logout"
                color="danger"
                onClick={handleExit}
              >
                <IoLogOut className="text-2xl mr-2" /> Sair
              </Link>
            </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </NextUINavbar>
  );
};

import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, User, Button, DropdownSection } from "@nextui-org/react";

export const NavbarDash = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ nome: string; email: string } | null>(null);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleExit = async () => {
    try {
      const response = await fetch("/api/auth/signout", { method: "POST" });

      if (response.ok) {
        window.location.href = "/"; // Redireciona para a página inicial
      } else {
        console.error("Erro ao realizar logout");
      }
    } catch (error) {
      console.error("Erro ao desconectar:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/dashboard/user", { method: "GET" });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error("Erro ao buscar dados do usuário");
        }
      } catch (error) {
        console.error("Erro ao carregar informações do usuário:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <NextUINavbar
      maxWidth="xl"
      position="sticky"
      className="border-b border-b-default-200 backdrop-blur-sm bg-foreground-50/60"
    >
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarMenuToggle
          icon={() => (isOpen ? <IoClose /> : <IoMenu />)}
          onClick={handleClick}
        />
        <NavbarBrand as="li" className="gap-3 max-w-fit">
          <NextLink className="flex justify-start items-center gap-1" href="/dashboard">
            <Logo />
          </NextLink>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="basis-1 pl-4" justify="end">
        <ThemeSwitch />
      </NavbarContent>

      <div className="flex items-center gap-4">
        <Dropdown placement="bottom-start">
          <DropdownTrigger>
            <User
              as="button"
              avatarProps={{
                isBordered: true,
                // Aqui usamos o nome diretamente para gerar as iniciais automaticamente
                name: user ? user.nome : "Usuário", // Gera as iniciais com base no nome
              }}
              className="transition-transform"
              name={user ? user.nome : "Usuário"}
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="User Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-bold">Logado como</p>
              <p className="font-bold">{user ? user.email : "Carregando..."}</p>
            </DropdownItem>
            <DropdownItem key="settings">Minha conta</DropdownItem>
            <DropdownItem key="logout" color="danger" selectedIcon={<IoLogOut />} onClick={handleExit}>
              <p className="text-danger">
                Sair
              </p>
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </div>

      <NavbarMenu className="bg-foreground-50/60 md:w-[400px] md:right-0 flex flex-col justify-between">
        <div className="mx-4 mt-2 flex flex-col gap-2 md:gap">
          <NavbarMenuItem key="1">
            <Link
              className="transition-all hover:text-primary"
              color="foreground"
              href="/dashboard"
            >
              Início
            </Link>
          </NavbarMenuItem>
          <NavbarMenuItem key="2">
            <Link
              className="transition-all hover:text-primary"
              color="foreground"
              href="/dashboard/sobre"
            >
              sobre a mentoria
            </Link>
          </NavbarMenuItem>
        </div>
        <p className="text-small text-foreground-400 mx-4 mb-2">
          © {new Date().getFullYear()} Mentoria Integração Transdiciplinar
        </p>
      </NavbarMenu>
    </NextUINavbar>
  );
};

export const NavbarAdmin = () => {
  const [user, setUser] = useState<{ nome: string; email: string } | null>(null);

  const handleExit = async () => {
    try {
      const response = await fetch("/api/auth/signout", { method: "POST" });

      if (response.ok) {
        window.location.href = "/"; // Redireciona para a página inicial
      } else {
        console.error("Erro ao realizar logout");
      }
    } catch (error) {
      console.error("Erro ao desconectar:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/dashboard/user", { method: "GET" });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        } else {
          console.error("Erro ao buscar dados do usuário");
        }
      } catch (error) {
        console.error("Erro ao carregar informações do usuário:", error);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="h-full flex flex-col justify-between">
      <div className="p-4">
        <h2 className="text-lg font-bold">Admin</h2>
        <nav className="space-y-2 mt-4">
          <Link className="block text-primary" href="/admin">
            Início
          </Link>
          <Link
            className="block text-primary"
            href="/admin/alunos"
          >
            Alunos
          </Link>
          <Link
            className="block text-primary"
            href="/admin/modulos"
          >
            Módulos
          </Link>
          <Link
            className="block text-primary"
            href="/admin/conteudos"
          >
            Conteúdos
          </Link>
        </nav>
      </div>
      <div className="p-4 border-t border-default-200">
        <div className="flex items-center justify-between gap-4">
          <div>
            {user ? user.nome : "Usuário"}
            <p className="text-xs text-default-400">
              {user ? user.email : "Carregando..."}
            </p>
          </div>
          <Dropdown placement="right-end">
            <DropdownTrigger>
              <Button isIconOnly size="sm" variant="light">
                <IoSettings />
              </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="User Actions" variant="flat">
              <DropdownItem isReadOnly key="profile" className="h-14 gap-2">
                <p className="font-bold">Logado como</p>
                <p className="font-bold">{user ? user.email : "Carregando..."}</p>
              </DropdownItem>
              <DropdownItem key={"theme"} isReadOnly>
                <div className="flex items-center justify-around">
                  <Button isIconOnly size="sm" variant="light">
                    <ThemeSwitch />
                  </Button>
                  <Button onClick={handleExit} isIconOnly size="sm" variant="light">
                    <MdOutlineExitToApp className="text-xl text-danger" />
                  </Button>
                </div>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </div>
    </div>
  );
};