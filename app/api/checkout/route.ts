import Stripe from "stripe";
import getConnection from "@/config/connection";
import { setCache, getCache } from "@/config/cache"; // Funções de cache para IndexedDB

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(req: Request) {
  const { customerId, priceId, usuarioId, couponCode } = await req.json();

  if (!customerId || !priceId || !usuarioId) {
    return new Response(
      JSON.stringify({ error: "Campos obrigatórios estão ausentes" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  let connection;
  try {
    connection = await getConnection();

    // URLs de retorno
    const successUrl = `${process.env.NEXT_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${process.env.NEXT_BASE_URL}/checkout`;

    // Adicionando lógica de cupom
    let discounts = [];
    if (couponCode) {
      try {
        const coupon = await stripe.coupons.retrieve(couponCode);
        if (coupon && coupon.valid) {
          discounts.push({ coupon: coupon.id });
        } else {
          throw new Error("Cupom inválido ou expirado");
        }
      } catch (error) {
        console.error("Erro ao validar cupom:", error);
        return new Response(
          JSON.stringify({ error: "Cupom inválido ou expirado" }),
          { status: 400, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    // Verificar se já existe uma sessão de checkout ativa para o usuário
    const existingSession = await getCache(`checkout_session_${usuarioId}`);
    if (existingSession) {
      // Redirecionar para a sessão de checkout existente
      return new Response(
        JSON.stringify({ sessionId: existingSession }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Marcar que uma sessão está em andamento no cache com o ID da sessão (não 'active')
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "boleto"],
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      discounts, // Aplica os descontos
      metadata: { usuarioId }, // Inclui o ID do usuário nos metadados
    });

    // Armazenar o ID da sessão no cache (não apenas 'active')
    await setCache(`checkout_session_${usuarioId}`, session.id);

    // Inserindo a compra no banco com status "pending"
    const [result]: any = await connection.execute(
      `INSERT INTO assinaturas 
        (usuario_id, stripe_payment_id, valor, status, data_criacao) 
      VALUES (?, ?, ?, ?, NOW())`,
      [usuarioId, session.id, 0, "inativa"], // Status inicial "inativa"
    );

    if (!result.insertId) {
      throw new Error("Falha ao registrar compra no banco de dados");
    }

    return new Response(
      JSON.stringify({ sessionId: session.id }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Erro ao criar sessão de checkout:", error);
    return new Response(
      JSON.stringify({ error: "Erro ao processar a solicitação" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    if (connection) {
      await connection.release();
    }
  }
}
