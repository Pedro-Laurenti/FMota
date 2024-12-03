import { useState } from "react";
import { IoMenu, IoLogOut } from "react-icons/io5";
import { Link } from "@nextui-org/react";
import { ThemeSwitch } from "@/components/theme-switch";

export const MenuToggle = ({ onLogout }: { onLogout: () => void }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <div
      className="absolute top-5 right-5 flex flex-row-reverse p-3 rounded-full dark:bg-black/30 bg-white/10 "
      onMouseEnter={handleMenuToggle}
      onMouseLeave={handleMenuToggle}
    >
      <IoMenu className="text-xl cursor-pointer" />
      <div
        className={`transition-all ease-in-out duration-300 ${
          menuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
        }`}
      >
        {menuOpen && (
          <div className="flex items-center gap-5 mx-5">
            <Link
              className="hover:cursor-pointer"
              key="logout"
              color="danger"
              onClick={onLogout}
            >
              <IoLogOut className="text-xl mr-2" />
            </Link>
            <ThemeSwitch />
            <div className="border-primary-500 border-l-1 h-full mx-2" />
          </div>
        )}
      </div>
    </div>
  );
};
