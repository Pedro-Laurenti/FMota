import bcrypt from "bcrypt";
import createConnection from "@/config/connection";
import jwt from "jsonwebtoken";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-11-20.acacia",
});

export async function POST(req: Request) {
  const { nome, email, senha, tipo_usuario, numero_contato } = await req.json();

  if (!nome || !email || !senha || !tipo_usuario || !numero_contato) {
    return new Response(
      JSON.stringify({ error: "Todos os campos são obrigatórios" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  if (!["administrador", "assinante", "pendente"].includes(tipo_usuario)) {
    return new Response(
      JSON.stringify({ error: "Tipo de usuário inválido" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const hashedPassword = await bcrypt.hash(senha, 10);

  let connection;
  try {
    connection = await createConnection();

    // Verifica se o email já está cadastrado
    const [rows]: any = await connection.execute(
      `SELECT id FROM usuarios WHERE email = ?`,
      [email],
    );

    if (Array.isArray(rows) && rows.length > 0) {
      return new Response(
        JSON.stringify({ error: "Este email já está em uso" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Cria o usuário no banco de dados
    const [result]: any = await connection.execute(
      `INSERT INTO usuarios (nome, email, senha_hash, tipo_usuario, numero_contato) VALUES (?, ?, ?, ?, ?)`,
      [nome, email, hashedPassword, tipo_usuario, numero_contato],
    );

    const usuarioId = result.insertId;

    // Cria o customer na Stripe
    const stripeCustomer = await stripe.customers.create({
      name: nome,
      email,
      phone: numero_contato,
      metadata: { usuarioId: String(usuarioId) },
    });

    // Atualiza o usuário no banco com o ID do customer da Stripe
    await connection.execute(
      `UPDATE usuarios SET stripe_customer_id = ? WHERE id = ?`,
      [stripeCustomer.id, usuarioId],
    );

    // Gera o token JWT
    const secretKey = process.env.TOKEN_SECRET_KEY;
    if (!secretKey) {
      throw new Error("TOKEN_SECRET_KEY não está definido");
    }

    const token = jwt.sign({ id: usuarioId, tipo_usuario }, secretKey, {
      expiresIn: "1h",
    });

    // Criando os cabeçalhos e configurando os cookies
    const headers = new Headers({
      "Content-Type": "application/json",
    });

    // Adicionando os cookies
    headers.append("Set-Cookie", `authToken=${token}; HttpOnly; Secure; Path=/; Max-Age=3600`);
    headers.append(
      "Set-Cookie",
      `stripe_customer_id=${stripeCustomer.id}; Secure; Path=/; Max-Age=3600`,
    );
    headers.append(
      "Set-Cookie",
      `internal_user_id=${usuarioId}; Secure; Path=/; Max-Age=3600`,
    );

    return new Response(
      JSON.stringify({ token, tipo_usuario, id: usuarioId }),
      { status: 201, headers },
    );
  } catch (error) {
    console.error("Erro na criação do usuário ou customer:", error);
    return new Response(
      JSON.stringify({ error: "Erro no servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
