import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import getConnection from "@/config/connection";
import { getOrSetCache } from "@/config/cache"; // Função global de cache que usaremos

export async function POST(req: Request) {
  const { email, senha } = await req.json();

  if (!email || !senha) {
    return new Response(
      JSON.stringify({ error: "Email e senha são obrigatórios" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const cacheKey = `login_attempts_${email}`;

  try {
    // Limitação de tentativas de login usando cache local
    const attempts = await getOrSetCache(cacheKey, async () => {
      return 0; // Caso não exista, retorna 0 tentativas
    });

    if (attempts >= 5) {
      return new Response(
        JSON.stringify({ error: "Muitas tentativas de login. Aguarde alguns minutos." }),
        { status: 429, headers: { "Content-Type": "application/json" } },
      );
    }

    const connection = await getConnection();

    // Consulta para buscar usuário pelo email
    const [rows]: any = await connection.execute(
      `SELECT id, senha_hash, tipo_usuario, stripe_customer_id FROM usuarios WHERE email = ?`,
      [email],
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      // Incrementa as tentativas no cache e define o tempo de expiração
      await getOrSetCache(cacheKey, async () => {
        return attempts + 1;
      });

      return new Response(
        JSON.stringify({ error: "Usuário não encontrado" }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }

    const [user] = rows;

    // Validação da senha
    const isValidPassword = await bcrypt.compare(senha, user.senha_hash);

    if (!isValidPassword) {
      // Incrementa as tentativas no cache e define o tempo de expiração
      await getOrSetCache(cacheKey, async () => {
        return attempts + 1;
      });

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

    // Limpa as tentativas de login ao sucesso
    await getOrSetCache(cacheKey, async () => {
      return 0; // Resetar as tentativas de login após sucesso
    });

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
