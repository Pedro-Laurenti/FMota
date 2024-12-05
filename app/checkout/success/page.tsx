"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardHeader, CardFooter, Button, Image, CardBody, Link, Code, Spinner } from "@nextui-org/react";

export default function Sucesso() {
  const searchParams = useSearchParams(); // Hook para acessar os parâmetros de consulta dinamicamente
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const sessionId = searchParams.get("session_id"); // Pega o parâmetro "session_id" da URL

      if (!sessionId) {
        setError("Erro: Session ID não encontrada.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch("/api/checkout/success", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ session_id: sessionId }),
        });

        if (!res.ok) {
          const { error } = await res.json();
          throw new Error(error || "Erro ao buscar dados.");
        }

        const { session } = await res.json();
        setSession(session);
      } catch (err: any) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [searchParams]);

  if (loading) return <Spinner />;
  if (error) return <p>Erro: {error}</p>;

  return (
    <div className="flex flex-col items-center gap-4">
      <Card isFooterBlurred className="w-full h-[300px] col-span-12 sm:col-span-7">
        <CardHeader className="flex flex-col items-start bg-black/50 backdrop-blur-lg">
          <p className="text-tiny text-white/60 uppercase font-bold">Dados confirmados</p>
          <h4 className="text-success font-medium text-xl">Pagamento Concluído!</h4>
        </CardHeader>
        <CardBody className="flex items-center justify-center">
          <Code color="success" className="w-full overflow-hidden">
            <p>Pagamento ID: {session.id}</p>
            <p>Cliente: {session.customer_details?.name || "Nome não disponível"}</p>
            <p>Email: {session.customer_details?.email || "Email não disponível"}</p>
            <p>Valor: R$ {(session.amount_total! / 100).toFixed(2)}</p>
            <p>Status do Pagamento: {session.payment_status === "paid" ? "Pago" : "Inativo"}</p>
          </Code>
        </CardBody>
        <CardFooter className="bg-black/40 border-t-1 border-default-600 dark:border-default-100">
          <Link className="w-full flex items-center justify-center" href="/dashboard">
            <Button className="w-fit" color="success">
              Continuar para o Dashboard
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
