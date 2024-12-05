import { NextRequest, NextResponse } from "next/server";
import getConnection from "@/config/connection";
import { deleteCache } from "@/config/cache";
import { randomBytes } from "crypto";
import { format } from "date-fns";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();

    if (!userId || isNaN(userId)) {
      return NextResponse.json(
        { error: "ID do usuário inválido." },
        { status: 400 }
      );
    }

    const connection = await getConnection();

    // Verifica se o usuário existe
    const [user]: any = await connection.execute(
      "SELECT id FROM usuarios WHERE id = ?",
      [userId]
    );

    if (!user.length) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    // Gera um token temporário
    const token = randomBytes(32).toString("hex");
    const expirationDate = format(
      new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      "yyyy-MM-dd HH:mm:ss"
    );

    // Insere o token na tabela de tokens temporários
    await connection.execute(
      `INSERT INTO senha_temp_tokens (user_id, token, validade)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
       token = VALUES(token), validade = VALUES(validade)`,
      [userId, token, expirationDate]
    );

    // Limpa o cache, caso necessário
    await deleteCache(`users_page_*`);

    // Retorna o link gerado
    const resetLink = `${process.env.NEXT_BASE_URL}/signin/reset-password?token=${token}`;
    return NextResponse.json({ link: resetLink });
  } catch (error) {
    console.error("Erro ao gerar link de redefinição de senha:", error);
    return NextResponse.json(
      { error: "Erro interno ao gerar o link de redefinição." },
      { status: 500 }
    );
  }
}
