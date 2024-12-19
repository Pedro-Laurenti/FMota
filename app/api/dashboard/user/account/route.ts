import { NextRequest, NextResponse } from "next/server";
import getConnection from "@/config/connection";
import { deleteCache, getCache, setCache } from "@/config/cache";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "Parâmetro 'userId' é obrigatório" }, { status: 400 });
  }

  try {
    const cacheKey = `user_${userId}`;
    const cachedUser = await getCache(cacheKey);

    if (cachedUser) {
      return NextResponse.json(JSON.parse(cachedUser), { status: 200 });
    }

    const connection = await getConnection();
    
    const [userRows]: any = await connection.execute(
      `SELECT id, nome, email, numero_contato, tipo_usuario, senha_hash, data_criacao, data_atualizacao, stripe_customer_id
       FROM usuarios
       WHERE id = ?`,
      [userId]
    );

    if (userRows.length === 0) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const user = userRows[0];

    const [subscriptionRows]: any = await connection.execute(
      `SELECT id, valor, status, stripe_payment_id, data_criacao
       FROM assinaturas
       WHERE usuario_id = ?`,
      [userId]
    );

    user.assinaturas = subscriptionRows;

    await setCache(cacheKey, JSON.stringify(user));

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("Erro ao buscar informações do usuário:", error);
    return NextResponse.json({ error: "Erro interno ao buscar usuário" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const {
    userId,
    nome,
    email,
    senhaHash,
    numeroContato,
    assinaturaValor,
    assinaturaStatus,
    stripePaymentId
  } = await req.json();

  if (!userId || !nome || !email) {
    return NextResponse.json(
      { error: "Os campos 'userId', 'nome' e 'email' são obrigatórios" },
      { status: 400 }
    );
  }

  try {
    const connection = await getConnection();

    // Atualiza informações do usuário
    await connection.execute(
      `UPDATE usuarios 
       SET nome = ?, email = ?, senha_hash = ?, numero_contato = ?, data_atualizacao = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [nome, email, senhaHash || null, numeroContato || null, userId]
    );

    // Atualiza ou insere assinatura
    if (assinaturaValor && assinaturaStatus && stripePaymentId) {
      await connection.execute(
        `INSERT INTO assinaturas (usuario_id, valor, status, stripe_payment_id, data_criacao) 
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE valor = ?, status = ?, stripe_payment_id = ?`,
        [
          userId,
          assinaturaValor,
          assinaturaStatus,
          stripePaymentId,
          assinaturaValor,
          assinaturaStatus,
          stripePaymentId
        ]
      );
    }

    // Invalida o cache após a atualização
    const cacheKey = `user_${userId}`;
    await deleteCache(cacheKey);

    return NextResponse.json({ success: true, message: "Informações atualizadas com sucesso" }, { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar informações do usuário:", error);
    return NextResponse.json({ error: "Erro interno ao atualizar usuário" }, { status: 500 });
  }
}
