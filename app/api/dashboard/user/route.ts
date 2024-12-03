import jwt from "jsonwebtoken";
import createConnection from "@/config/connection";

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

    // Busca informações do usuário no banco
    const connection = await createConnection();
    const [rows]: any = await connection.execute(
      `SELECT id, nome, email, tipo_usuario, stripe_customer_id FROM usuarios WHERE id = ?`,
      [decoded.id],
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const [user] = rows;

    // Retorna as informações do usuário
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
