"use client";
import { useEffect, useState } from "react";

type Props = {
  priceId: string;
  price: string;
  description: string;
  orderId: string;
};

const Subscription = ({ price, description }: Props) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();

    if (/iphone|ipod|android/i.test(userAgent)) {
      setIsMobile(true);
    }
  }, []);

  const handleSubmit = async () => {
    // Remove "R$" e converte para número
    const amount = parseFloat(price.replace("R$", "").replace(",", "."));

    // Substitua com a conta do recebedor
    const receiverAccount = "analistacomercial";

    // Formata o valor com vírgula como separador de centavos
    const formattedAmount = amount.toFixed(2).replace(".", ","); // Ex: 30,00

    // Cria a URL de pagamento com o valor formatado
    const paymentUrl = `https://pay.infinitepay.io/${receiverAccount}/${formattedAmount}`;

    // Abre o link em uma nova guia (ou janela)
    window.open(paymentUrl, "_blank");
  };

  return (
    <div>
      {isMobile ? (
        <p>This is a mobile device</p>
      ) : (
        <p>This is not a mobile device</p>
      )}
      <button className="btn btn-primary" onClick={handleSubmit}>
        Subscribe for {price}
      </button>
      <p>{description}</p>
    </div>
  );
};

export default Subscription;
