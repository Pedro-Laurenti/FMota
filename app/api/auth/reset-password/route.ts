import bcrypt from "bcrypt";
import createConnection from "@/config/connection";

export async function PATCH(req: Request) {
  const { email, token, novaSenha } = await req.json();

  if (!email || !token || !novaSenha) {
    return new Response(
      JSON.stringify({ error: "Email, token e nova senha são obrigatórios" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  let connection;
  try {
    connection = await createConnection();

    // Verifica se o usuário existe e obtém os dados de recuperação
    const [rows]: any = await connection.execute(
      `SELECT reset_token AS resetToken, reset_token_expiry AS resetTokenExpiry FROM usuarios WHERE email = ?`,
      [email],
    );

    if (!rows.length) {
      return new Response(JSON.stringify({ error: "Usuário não encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { resetToken, resetTokenExpiry } = rows[0];

    // Valida o token e verifica se está expirado
    if (
      Date.now() > resetTokenExpiry ||
      !(await bcrypt.compare(token, resetToken))
    ) {
      return new Response(
        JSON.stringify({ error: "Código de recuperação inválido ou expirado" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    // Atualiza a senha do usuário
    const senhaHash = await bcrypt.hash(novaSenha, 10);
    await connection.execute(
      `UPDATE usuarios 
       SET senha_hash = ?, reset_token = NULL, reset_token_expiry = NULL 
       WHERE email = ?`,
      [senhaHash, email],
    );

    return new Response(
      JSON.stringify({ message: "Senha redefinida com sucesso" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Erro ao redefinir a senha:", error);
    return new Response(JSON.stringify({ error: "Erro no servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
