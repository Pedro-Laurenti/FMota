import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import getConnection from "@/config/connection";
import { getCache } from "@/config/cache";  // Importando a função de cache

export async function GET(req: NextRequest) {
  const cookies = req.headers.get("cookie") || "";
  const authToken = cookies.split("; ").find((cookie) => cookie.startsWith("authToken="))?.split("=")[1];

  if (!authToken) {
    return new NextResponse(
      JSON.stringify({ error: "Usuário não autenticado" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const secretKey = process.env.TOKEN_SECRET_KEY;
    if (!secretKey) {
      throw new Error("TOKEN_SECRET_KEY não está definido");
    }

    // Verifica se o token foi revogado usando IndexedDB (cache)
    const isTokenBlacklisted = await getCache(`blacklist_${authToken}`);
    if (isTokenBlacklisted) {
      return new NextResponse(
        JSON.stringify({ error: "Token revogado" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Verifica e decodifica o token JWT
    const decoded: any = jwt.verify(authToken, secretKey);
    const userId = decoded.id;

    let connection;
    try {
      connection = await getConnection();
      const [rows]: any = await connection.execute(
        `SELECT status FROM assinaturas WHERE usuario_id = ? ORDER BY data_criacao DESC LIMIT 1`,
        [userId]
      );

      if (rows.length > 0 && rows[0].status === "ativa") {
        return new NextResponse(
          JSON.stringify({ status: "ativo" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      return new NextResponse(
        JSON.stringify({ status: "inativo" }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } finally {
      if (connection) {
        await connection.release();
      }
    }
  } catch (error) {
    console.error("Erro ao verificar status de pagamento:", error);
    return new NextResponse(
      JSON.stringify({ error: "Erro ao verificar pagamento" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
