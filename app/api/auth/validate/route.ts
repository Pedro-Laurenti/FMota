import jwt from "jsonwebtoken";
import { getCache } from "@/config/cache";  // Importando a função de cache

export async function POST(req: Request) {
  const cookies = req.headers.get("cookie");
  const token = cookies?.match(/authToken=([^;]+)/)?.[1];

  if (!token) {
    return new Response(
      JSON.stringify({ error: "Token não encontrado" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }

  const secretKey = process.env.TOKEN_SECRET_KEY;
  if (!secretKey) {
    throw new Error("TOKEN_SECRET_KEY is not defined");
  }

  try {
    // Verifica se o token está na blacklist (no cache)
    const isTokenBlacklisted = await getCache(`blacklist_${token}`);
    if (isTokenBlacklisted) {
      return new Response(
        JSON.stringify({ error: "Token revogado" }),
        { status: 401, headers: { "Content-Type": "application/json" } },
      );
    }

    // Verifica e decodifica o token JWT
    const payload = jwt.verify(token, secretKey) as { tipo_usuario: string };
    
    return new Response(
      JSON.stringify({ tipo_usuario: payload.tipo_usuario }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Token inválido ou expirado" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    );
  }
}
