import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import createConnection from "@/config/connection";

export async function POST(req: Request) {
  const { email, senha } = await req.json();

  if (!email || !senha) {
    return new Response(
      JSON.stringify({ error: "Email e senha são obrigatórios" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  let connection;
  try {
    connection = await createConnection();

    // Consulta para buscar usuário pelo email
    const [rows]: any = await connection.execute(
      `SELECT id, senha_hash, tipo_usuario, stripe_customer_id FROM usuarios WHERE email = ?`,
      [email],
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return new Response(
        JSON.stringify({ error: "Usuário não encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    const [user] = rows;

    // Validação da senha
    const isValidPassword = await bcrypt.compare(senha, user.senha_hash);

    if (!isValidPassword) {
      return new Response(
        JSON.stringify({ error: "Senha inválida" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    const secretKey = process.env.TOKEN_SECRET_KEY;
    if (!secretKey) {
      throw new Error("TOKEN_SECRET_KEY is not defined");
    }

    // Gera o token JWT com tipo de usuário "assinante" se aplicável
    const token = jwt.sign(
      { id: user.id, tipo_usuario: user.tipo_usuario },
      secretKey,
      { expiresIn: "1h" },
    );

    // Configurando cabeçalhos e cookies
    const headers = new Headers({
      "Content-Type": "application/json",
    });

    headers.append("Set-Cookie", `authToken=${token}; HttpOnly; Secure; Path=/; Max-Age=3600`);
    headers.append(
      "Set-Cookie",
      `stripe_customer_id=${user.stripe_customer_id}; Secure; Path=/; Max-Age=3600`,
    );
    headers.append(
      "Set-Cookie",
      `internal_user_id=${user.id}; Secure; Path=/; Max-Age=3600`,
    );

    return new Response(
      JSON.stringify({ token, tipo_usuario: user.tipo_usuario, internal_user_id: user.id }),
      { status: 200, headers },
    );
  } catch (error) {
    console.error("Erro ao realizar login:", error);
    return new Response(
      JSON.stringify({ error: "Erro no servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
