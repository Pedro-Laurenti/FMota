import { NextResponse } from "next/server";
import Stripe from "stripe";
import createConnection from "@/config/connection";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

const webhookSecret = process.env.STRIPE_SECRET_WEBHOOK_KEY!;

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return new Response(
      JSON.stringify({ error: "Assinatura ausente" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  let event: Stripe.Event;

  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err) {
    console.error("Erro de validação do webhook:", (err as Error).message);
    return new Response(
      JSON.stringify({ error: "Evento não validado" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  let connection;

  try {
    connection = await createConnection();

    const { type, data } = event;

    // Verificar se o evento é "checkout.session.completed"
    if (type === "checkout.session.completed") {
      const session = data.object as Stripe.Checkout.Session;

      const stripePaymentId = session.payment_intent as string;
      const stripeCustomerId = session.customer as string;
      const valor = session.amount_total ? session.amount_total / 100 : 0; // Valor total em reais
      const usuarioId = session.metadata?.usuario_id; // Seu metadata customizado

      // Registrar a compra
      await connection.execute(
        `INSERT INTO assinaturas (usuario_id, stripe_payment_id, valor, status, data_compra) 
         VALUES (?, ?, ?, ?, NOW())`,
        [usuarioId, stripePaymentId, valor, "succeeded"]
      );
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro no processamento do webhook:", error);
    return new Response(
      JSON.stringify({ error: "Erro interno" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    if (connection) await connection.end();
  }
}
