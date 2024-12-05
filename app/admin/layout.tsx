"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutAdmin } from "../layoutsBib";
import { Spinner } from "@nextui-org/react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  const validateUserType = async () => {
    try {
      const response = await fetch("/api/dashboard/user", { method: "GET" });

      if (!response.ok) {
        router.push("/signin"); // Redireciona se não conseguir obter informações do usuário
        return;
      }

      const data = await response.json();

      // Verifica se o tipo do usuário é "administrador"
      if (data.tipo_usuario !== "administrador") {
        router.push("/signin"); // Redireciona se o usuário não for administrador
      } else {
        setLoading(false); // Libera o layout se o tipo for válido
      }
    } catch (error) {
      console.error("Erro ao validar tipo de usuário:", error);
      router.push("/signin"); // Redireciona em caso de erro
    }
  };

  useEffect(() => {
    validateUserType();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  return <LayoutAdmin>{children}</LayoutAdmin>;
}
