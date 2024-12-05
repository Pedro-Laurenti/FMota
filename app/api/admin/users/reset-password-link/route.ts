import crypto from "crypto";
import getConnection from "@/config/connection";

export async function POST(req: Request) {
  const { userId } = await req.json();

  if (!userId) {
    return new Response(
      JSON.stringify({ error: "ID do usuário é obrigatório" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const connection = await getConnection();

    // Gera um token único
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Define a validade para 1 hora

    // Salva o token no banco de dados
    await connection.execute(
      `INSERT INTO senha_temp_tokens (user_id, token, validade) VALUES (?, ?, ?)`,
      [userId, token, expiresAt],
    );

    // Gera o link de redefinição
    const resetLink = `${process.env.NEXT_BASE_URL}/signin/reset-password?token=${token}`;

    return new Response(
      JSON.stringify({ message: "Link gerado com sucesso", link: resetLink }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Erro ao gerar o link de redefinição de senha:", error);
    return new Response(
      JSON.stringify({ error: "Erro no servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
