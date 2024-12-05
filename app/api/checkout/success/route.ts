import { NextResponse } from "next/server";
import Stripe from "stripe";
import getConnection from "@/config/connection";
import { setCache, getCache } from "@/config/cache";  // Importando as funções de cache

export async function POST(req: Request) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-11-20.acacia",
  });

  const { session_id } = await req.json();

  if (!session_id) {
    return NextResponse.json({ error: "Session ID não encontrada." }, { status: 400 });
  }

  try {
    // Recupera a sessão do Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    const usuarioId = session.metadata?.usuarioId;
    const valor = session.amount_total! / 100; // Valor em reais
    const stripePaymentId = session.id;

    let connection;
    try {
      connection = await getConnection();

      // Verificar se a sessão foi paga
      if (session.payment_status === "paid" && usuarioId && stripePaymentId) {
        // Verificar se já existe um pagamento para o usuário com o mesmo ID do pagamento no cache (IndexedDB)
        const paymentExists = await getCache(`payment_status_${stripePaymentId}`);
        if (paymentExists) {
          // Evita processamento duplicado
          return NextResponse.json({ message: "Pagamento já processado." }, { status: 200 });
        }

        // Marcar pagamento como processado no cache (IndexedDB) para evitar duplicação
        await setCache(`payment_status_${stripePaymentId}`, "processed");

        // Atualizar a assinatura no banco de dados para "ativa"
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

      return NextResponse.json({
        session,
      });
    } catch (dbError) {
      console.error("Erro ao acessar o banco de dados:", dbError);
      return NextResponse.json({ error: "Erro no banco de dados." }, { status: 500 });
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  } catch (stripeError) {
    console.error("Erro ao acessar o Stripe:", stripeError);
    return NextResponse.json({ error: "Erro ao acessar o Stripe." }, { status: 500 });
  }
}
