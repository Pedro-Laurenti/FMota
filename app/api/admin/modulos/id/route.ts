import { NextRequest, NextResponse } from "next/server";
import getConnection from "@/config/connection";
import { setCache, getCache, deleteCache } from "@/config/cache"; // Funções de cache para IndexedDB

// Função GET para obter os dados do módulo
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get("id");

  console.log("moduleId recebido:", moduleId);  // Verifique o valor do moduleId

  if (!moduleId) {
    return new Response("Parâmetro 'id' inválido", { status: 400 });
  }

  try {
    const cacheKey = `module_${moduleId}`;
    const cachedModule = await getCache(cacheKey);

    if (cachedModule) {
      console.log(`Módulo encontrado no cache para id: ${moduleId}`);
      return new Response(cachedModule, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Conectando ao banco de dados...");
    const connection = await getConnection();

    const [rows]: any = await connection.execute(
      `SELECT id, title FROM modules WHERE id = ?`,
      [moduleId]
    );

    console.log("Dados do banco:", rows);  // Verifique os dados retornados do banco

    if (rows.length === 0) {
      return new Response("Módulo não encontrado", { status: 404 });
    }

    const modulo = rows[0];
    await setCache(cacheKey, JSON.stringify(modulo));

    return new Response(JSON.stringify(modulo), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao buscar módulo:", error);
    return new Response(JSON.stringify({ error: "Erro ao recuperar o módulo" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Função PUT para atualizar os dados do módulo
export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const moduleId = url.searchParams.get("id");

  if (!moduleId) {
    return new Response("Parâmetro 'id' inválido", { status: 400 });
  }

  const body = await req.json();
  const { title } = body;

  if (!title) {
    return new Response("Título não fornecido para atualização", { status: 400 });
  }

  try {
    const connection = await getConnection();
    const [result]: any = await connection.execute(
      `UPDATE modules SET title = ? WHERE id = ?`,
      [title, moduleId]
    );

    // Limpar o cache após a atualização
    deleteCache(`module_${moduleId}`);

    if (result.affectedRows === 0) {
      return new Response("Módulo não encontrado ou não atualizado", { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Módulo atualizado com sucesso." }), { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar módulo:", error);
    return new Response("Erro ao atualizar módulo", { status: 500 });
  }
}
