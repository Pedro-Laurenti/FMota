import bcrypt from "bcrypt";
import getConnection from "@/config/connection";
import { getOrSetCache } from "@/config/cache"; // Função global de cache que utilizamos anteriormente

export async function PATCH(req: Request) {
  const { email, token, novaSenha } = await req.json();

  if (!email || !token || !novaSenha) {
    return new Response(
      JSON.stringify({ error: "Email, token e nova senha são obrigatórios" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const cacheKey = `password_reset_${email}`;

  try {
    // Usa a função de cache para verificar se a operação foi processada recentemente
    const cachedResponse = await getOrSetCache(cacheKey, async () => {
      const connection = await getConnection();

      // Verifica se o usuário existe e obtém os dados de recuperação
      const [rows]: any = await connection.execute(
        `SELECT reset_token AS resetToken, reset_token_expiry AS resetTokenExpiry FROM usuarios WHERE email = ?`,
        [email],
      );

      if (!rows.length) {
        return JSON.stringify({ error: "Usuário não encontrado" });
      }

      const { resetToken, resetTokenExpiry } = rows[0];

      // Valida o token e verifica se está expirado
      if (
        Date.now() > resetTokenExpiry ||
        !(await bcrypt.compare(token, resetToken))
      ) {
        return JSON.stringify({ error: "Código de recuperação inválido ou expirado" });
      }

      // Atualiza a senha do usuário
      const senhaHash = await bcrypt.hash(novaSenha, 10);
      await connection.execute(
        `UPDATE usuarios 
         SET senha_hash = ?, reset_token = NULL, reset_token_expiry = NULL 
         WHERE email = ?`,
        [senhaHash, email],
      );

      return JSON.stringify({
        message: "Senha redefinida com sucesso",
      });
    });

    // Retorna a resposta
    return new Response(cachedResponse, {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao redefinir a senha:", error);
    return new Response(JSON.stringify({ error: "Erro no servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
