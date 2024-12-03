"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDash } from "../layoutsBib";
import Countdown from "@/components/Countdown";
import { MenuToggle } from "@/components/menutogle"; // Importa o novo componente MenuToggle

// Data de lançamento para o contador
const releaseDate = new Date(Date.UTC(2024, 9, 18));

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isCountdownComplete, setIsCountdownComplete] = useState(false);
  const [loading, setLoading] = useState(true);

  const handleCountdownComplete = () => {
    setIsCountdownComplete(true);
  };

  // Função para verificar status de pagamento
  const checkPaymentStatus = async () => {
    try {
      const res = await fetch("/api/checkout/status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (data.status !== "ativo") {
        router.push("/checkout"); // Redireciona para o checkout se o pagamento não for ativo
      } else {
        setLoading(false); // Libera o layout após confirmação de pagamento
      }
    } catch (error) {
      console.error("Erro ao verificar o status de pagamento:", error);
      router.push("/checkout"); // Redireciona em caso de erro
    }
  };

  useEffect(() => {
    if (isCountdownComplete) {
      // Verifica status de pagamento apenas após o término do contador
      checkPaymentStatus();
    }
  }, [isCountdownComplete]);

  // Função de logout
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

  if (!isCountdownComplete) {
    return (
      <div className="flex items-center justify-center h-screen">
        <MenuToggle onLogout={handleExit} /> {/* Usando o novo componente MenuToggle */}
        <Countdown
          releaseTime={releaseDate.getTime()}
          onComplete={handleCountdownComplete}
        />
      </div>
    );
  }

  // Exibe carregamento enquanto verifica o pagamento
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Carregando...</p>
      </div>
    );
  }

  // Renderiza o layout após a validação completa
  return <LayoutDash>{children}</LayoutDash>;
}
