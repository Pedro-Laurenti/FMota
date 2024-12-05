import { NextResponse } from "next/server";
import Stripe from "stripe";
import getConnection from "@/config/connection";
import { setCache, getCache } from "@/config/cache"; // Importando as funções de cache para IndexedDB

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-11-20.acacia",
  });

  const { customerId } = await req.json();

  if (!customerId) {
    return NextResponse.json({ error: "customerId não fornecido." }, { status: 400 });
  }

  try {
    // Recupera as sessões de checkout com status "paid" para o cliente
    const sessions = await stripe.checkout.sessions.list({
      customer: customerId,  // Filtro para o cliente específico
      status: 'complete',     // Filtro para sessões pagas
      limit: 1,               // Limita para a mais recente
    });

    if (sessions.data.length > 0) {
      const session = sessions.data[0];

      const usuarioId = session.metadata?.usuarioId;
      const valor = session.amount_total! / 100; // Valor em reais
      const stripePaymentId = session.id;

      // Verifica se o pagamento já foi processado usando IndexedDB
      const paymentProcessed = await getCache(`payment_status_${stripePaymentId}`);
      if (paymentProcessed) {
        // Evita processamento duplicado
        return NextResponse.json({ message: "Pagamento já processado." }, { status: 200 });
      }

      // Marca o pagamento como processado no IndexedDB
      await setCache(`payment_status_${stripePaymentId}`, "processed");

      let connection;
      try {
        connection = await getConnection();

        if (usuarioId && stripePaymentId) {
          if (session.payment_status === "paid") {
            // Atualizar a assinatura para "ativa"
            await connection.execute(
              `UPDATE assinaturas 
              SET valor = ?, status = ?, data_criacao = NOW() 
              WHERE stripe_payment_id = ? AND usuario_id = ?`,
              [valor, "ativa", stripePaymentId, usuarioId],
            );

            // Atualizar o tipo de usuário para "assinante"
            await connection.execute(
              `UPDATE usuarios SET tipo_usuario = ? WHERE id = ?`,
              ["assinante", usuarioId],
            );
          }
        }

        return NextResponse.json({
          paymentStatus: "paid",
          session,
        });
      } catch (dbError) {
        console.error("Erro ao acessar o banco de dados:", dbError);
        return NextResponse.json({ error: "Erro ao acessar o banco de dados." }, { status: 500 });
      } finally {
        if (connection) {
          await connection.release();
        }
      }
    }

    return NextResponse.json({ paymentStatus: "unpaid" });

  } catch (error) {
    console.error("Erro ao verificar pagamento do cliente:", error);
    return NextResponse.json({ error: "Erro ao verificar pagamento." }, { status: 500 });
  }
}
