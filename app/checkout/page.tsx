"use client";

import { useEffect, useState } from "react";
import StripeSubs from "@/components/stripeSubs";
import { Card, CardHeader, CardFooter, Button, Image, CardBody, Spinner } from "@nextui-org/react";
import Cookies from "js-cookie";
import Link from "next/link";

export default function Checkout() {
  const [isPaymentActive, setIsPaymentActive] = useState(false); // Estado para controlar o pagamento ativo
  const [loading, setLoading] = useState(true); // Estado para indicar carregamento

  // Função para verificar o status de pagamento
  const checkPaymentStatus = async () => {
    try {
      const res = await fetch("/api/checkout/status", {
        method: "GET", // Fazendo GET, conforme o padrão implementado
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        throw new Error(`Erro na resposta: ${res.status}`);
      }

      const data = await res.json();
      if (data.status === "ativo") {
        setIsPaymentActive(true);
      } else {
        // Se pagamento não estiver ativo, verifica na Stripe
        await checkStripePaymentStatus();
      }
    } catch (error) {
      console.error("Erro ao verificar status de pagamento:", error);
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar o status do pagamento na Stripe
  const checkStripePaymentStatus = async () => {
    const customerId = Cookies.get("stripe_customer_id");
    if (!customerId) {
      return;
    }

    try {
      const response = await fetch("/api/checkout/verifyPayment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });

      const data = await response.json();
      if (response.ok && data.paymentStatus === "paid") {
        // Se o pagamento foi bem-sucedido, chama a API de sucesso
        await handlePaymentSuccess();
        setIsPaymentActive(true);
      }
    } catch (error) {
      console.error("Erro ao verificar pagamento na Stripe:", error);
    }
  };

  // Chama a API de sucesso para atualizar o status do pagamento
  const handlePaymentSuccess = async () => {
    const sessionId = Cookies.get("stripe_session_id"); // O sessionId deve ser armazenado após o pagamento
    try {
      const response = await fetch("/api/checkout/success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar sucesso de pagamento.");
      }
      console.log("Pagamento confirmado e status atualizado");
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);
    }
  };

  // Chama a função de verificação ao carregar o componente
  useEffect(() => {
    checkPaymentStatus();
  }, []);

  if (loading) return <Spinner />;

  return (
    <div className="flex justify-center gap-4">
      <div className="w-full max-w-md">
        {isPaymentActive ? (
          <Card isFooterBlurred className="w-full">
            <CardHeader>
              <h2 className="text-2xl font-semibold text-success-500">Pagamento confirmado!</h2>
            </CardHeader>
            <CardBody>
              <p className="">O seu pagamento já foi processado com sucesso.</p>
              <p className="">Agora você é um membro ativo.</p>
            </CardBody>
            <CardFooter>
              <Link href="/dashboard">
                <Button color="success" href="/dashboard" className="w-full">
                  Continuar
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ) : (
          <Card isFooterBlurred className="w-full h-full min-h-96">
            <CardHeader className="absolute z-10 flex-col items-start bg-black/50 backdrop-blur-lg border-b-1 border-default-600 dark:border-default-100">
              <p className="text-tiny text-white/60 uppercase font-bold">Tudo pronto? </p>
              <h4 className="text-white/90 font-medium text-xl">Faça parte do Sucesso!</h4>
            </CardHeader>
            <Image
              removeWrapper
              alt="Relaxing app background"
              className="z-0 w-full h-full object-cover"
              src="relative/covertemplate.jpeg"
            />
            <CardFooter className="absolute bg-black/40 bottom-0 z-10 border-t-1 border-default-600 dark:border-default-100">
              <StripeSubs
                priceId="price_1QRgCXG6hI1bVsYEluoQqVg9"
                price="Adquirir"
              />
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
