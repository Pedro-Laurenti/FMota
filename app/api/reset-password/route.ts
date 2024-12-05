import bcrypt from "bcrypt";
import getConnection from "@/config/connection";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  const { token, newPassword } = await req.json();

  if (!token || !newPassword) {
    return new Response(
      JSON.stringify({ error: "Token e nova senha são obrigatórios" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  try {
    const connection = await getConnection();

    // Consulta o banco de dados para validar o token
    const [rows]: any = await connection.execute(
      `SELECT user_id, validade FROM senha_temp_tokens WHERE token = ?`,
      [token],
    );

    if (!Array.isArray(rows) || rows.length === 0) {
      return new Response(
        JSON.stringify({ error: "Token inválido ou expirado" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const [resetToken] = rows;

    // Verifica se o token expirou
    if (new Date(resetToken.validade) < new Date()) {
      return new Response(
        JSON.stringify({ error: "Token expirado" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Criptografa a nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Atualiza a senha do usuário no banco
    await connection.execute(
      `UPDATE usuarios SET senha_hash = ? WHERE id = ?`,
      [hashedPassword, resetToken.user_id],
    );

    // Remove o token usado para evitar reutilização
    await connection.execute(
      `DELETE FROM senha_temp_tokens WHERE token = ?`,
      [token],
    );

    // Gera um novo token de autenticação JWT
    const secretKey = process.env.TOKEN_SECRET_KEY;
    if (!secretKey) {
      throw new Error("TOKEN_SECRET_KEY is not defined");
    }

    const authToken = jwt.sign(
      { id: resetToken.user_id },
      secretKey,
      { expiresIn: "1h" },
    );

    // Configura os cookies
    const headers = new Headers({
      "Content-Type": "application/json",
    });

    headers.append(
      "Set-Cookie",
      `authToken=${authToken}; HttpOnly; Secure; Path=/; Max-Age=3600`,
    );

    return new Response(
      JSON.stringify({ message: "Senha redefinida com sucesso", authToken }),
      { status: 200, headers },
    );
  } catch (error) {
    console.error("Erro ao redefinir a senha:", error);
    return new Response(
      JSON.stringify({ error: "Erro no servidor" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
