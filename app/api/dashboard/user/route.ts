import jwt from "jsonwebtoken";
import getConnection from "@/config/connection";
import { setCache, getCache } from "@/config/cache"; // Funções de cache para IndexedDB ou alternativas

export async function GET(req: Request) {
  const cookies = req.headers.get("cookie") || "";
  const authToken = cookies.split("; ").find((cookie) => cookie.startsWith("authToken="))?.split("=")[1];

  if (!authToken) {
    return new Response(JSON.stringify({ error: "Usuário não autenticado" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const secretKey = process.env.TOKEN_SECRET_KEY;
    if (!secretKey) {
      throw new Error("TOKEN_SECRET_KEY não está definido");
    }

    // Verifica o token JWT
    const decoded: any = jwt.verify(authToken, secretKey);

    // Verifica se os dados do usuário estão no cache
    const cachedUser = await getCache(`user:${decoded.id}`);
    if (cachedUser) {
      console.log("Usuário encontrado no cache");
      return new Response(cachedUser, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Se não estiver no cache, busca no banco de dados
    console.log("Usuário não encontrado no cache, consultando o banco...");
    const connection = await getConnection();
    const [rows]: any = await connection.execute(
      `SELECT id, nome, email, tipo_usuario, stripe_customer_id FROM usuarios WHERE id = ?`,
      [decoded.id]
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const [user] = rows;

    // Armazena os dados do usuário no cache por 10 minutos
    await setCache(`user:${decoded.id}`, JSON.stringify(user)); // Cache expirando em 10 minutos

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao buscar informações do usuário:", error);
    return new Response(JSON.stringify({ error: "Erro ao autenticar usuário" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
