import { NextRequest, NextResponse } from "next/server";
import getConnection from "@/config/connection";
import { setCache, getCache } from "@/config/cache"; // Funções de cache para IndexedDB

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  console.log("userId recebido:", userId);  // Verifique o valor do userId

  if (!userId) {
    return new Response("Parâmetro 'userId' inválido", { status: 400 });
  }

  try {
    const cacheKey = `user_${userId}`;
    const cachedUser = await getCache(cacheKey);

    if (cachedUser) {
      console.log(`Usuário encontrado no cache para userId: ${userId}`);
      return new Response(cachedUser, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Conectando ao banco de dados...");
    const connection = await getConnection();

    const [rows]: any = await connection.execute(
      `SELECT id, nome, email, tipo_usuario, data_criacao, numero_contato
       FROM usuarios
       WHERE id = ?`,
      [userId]
    );

    console.log("Dados do banco:", rows);  // Verifique os dados retornados do banco

    if (rows.length === 0) {
      return new Response("Usuário não encontrado", { status: 404 });
    }

    const user = rows[0];
    await setCache(cacheKey, JSON.stringify(user));

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return new Response(JSON.stringify({ error: "Erro ao recuperar o usuário" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId");

  if (!userId) {
    return new Response("Parâmetro 'userId' inválido", { status: 400 });
  }

  const body = await req.json();
  const { nome, email, tipo_usuario, numero_contato, data_criacao } = body;

  if (!nome || !email || !tipo_usuario || !numero_contato || !data_criacao) {
    return new Response("Dados incompletos para atualização", { status: 400 });
  };

  try {
    const connection = await getConnection();
    const [result]: any = await connection.execute(
      `UPDATE usuarios SET nome = ?, email = ?, tipo_usuario = ?, numero_contato = ?, data_criacao = ?
       WHERE id = ?`,
      [nome, email, tipo_usuario, numero_contato, data_criacao, userId]
    );

    // Limpar o cache após a atualização
    const cacheKey = `user_${userId}`;
    await setCache(cacheKey, JSON.stringify({ nome, email, tipo_usuario, numero_contato, data_criacao }));

    if (result.affectedRows === 0) {
      return new Response("Usuário não encontrado ou não atualizado", { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Usuário atualizado com sucesso." }), { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return new Response("Erro ao atualizar usuário", { status: 500 });
  }
}
