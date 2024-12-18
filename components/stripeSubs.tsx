import { useState, useEffect } from "react";
import { Button, Input, Checkbox } from "@nextui-org/react";
import Cookies from "js-cookie";
import { loadStripe } from "@stripe/stripe-js"; // Importação correta

export default function StripePayment({ priceId, price }: { priceId: string; price: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [couponCode, setCouponCode] = useState<string>("");
  const [hasCoupon, setHasCoupon] = useState<boolean>(false); // Estado para controlar a checkbox

  // Efeito para verificar a URL e preencher o campo de cupom automaticamente
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const couponFromUrl = urlParams.get("coupon");
    if (couponFromUrl) {
      setCouponCode(couponFromUrl);
      setHasCoupon(true); // Marcar como verdadeiro, caso o cupom seja passado
    }
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    const customerId = Cookies.get("stripe_customer_id");
    const usuarioId = Cookies.get("internal_user_id");

    if (!usuarioId || !customerId) {
      setError("Usuário ou cliente não encontrado.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, priceId, usuarioId, couponCode: hasCoupon ? couponCode : undefined }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro inesperado ao processar o pagamento.");
      }

      if (data.sessionId) {
        const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);
        if (!stripe) {
          setError("Erro ao carregar Stripe.");
          return;
        }
        await stripe.redirectToCheckout({ sessionId: data.sessionId });
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2 flex-col-reverse md:flex-row justify-between w-full">
      <div>
        <Checkbox
          isSelected={hasCoupon}
          onChange={(e) => setHasCoupon(e.target.checked)}
        >
          Tenho um cupom
        </Checkbox>
        {hasCoupon && (
          <div className="mt-4">
            <Input
              placeholder="Código do cupom"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
          </div>
        )}
      </div>
      <div>
        <Button className="w-full" color="primary" isLoading={loading} disabled={loading} onPress={handlePayment}>
          {price}
        </Button>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>
    </div>
  );
}
