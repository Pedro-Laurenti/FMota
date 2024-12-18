import { getCache, setCache, deleteCache } from "@/config/cache";
import getConnection from "@/config/connection";
import { NextRequest } from "next/server";

// Função GET para obter os dados de um conteúdo específico
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const contentId = searchParams.get("id");

  console.log("contentId recebido:", contentId);  // Verifique o valor do contentId

  if (!contentId) {
    return new Response("Parâmetro 'id' inválido", { status: 400 });
  }

  try {
    const cacheKey = `content_${contentId}`;
    const cachedContent = await getCache(cacheKey);

    if (cachedContent) {
      console.log(`Conteúdo encontrado no cache para id: ${contentId}`);
      return new Response(cachedContent, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("Conectando ao banco de dados...");
    const connection = await getConnection();

    const [rows]: any = await connection.execute(
      `SELECT id, title, description, file_download, module_id, rich_text, type, video_url 
       FROM contents WHERE id = ?`,
      [contentId]
    );

    console.log("Dados do banco:", rows);  // Verifique os dados retornados do banco

    if (rows.length === 0) {
      return new Response("Conteúdo não encontrado", { status: 404 });
    }

    const content = rows[0];
    await setCache(cacheKey, JSON.stringify(content));

    return new Response(JSON.stringify(content), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao buscar conteúdo:", error);
    return new Response(JSON.stringify({ error: "Erro ao recuperar o conteúdo" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const contentId = url.searchParams.get("id");

  if (!contentId) {
    return new Response("Parâmetro 'id' inválido", { status: 400 });
  }

  const body = await req.json();
  const { title, description, file_download, module_id, rich_text, type, video_url } = body;

  if (!title || !type || !module_id) {
    return new Response(
      "Os campos 'title', 'type' e 'module_id' são obrigatórios", 
      { status: 400 }
    );
  }

  try {
    const connection = await getConnection();
    const [result]: any = await connection.execute(
      `UPDATE contents SET 
         title = ?, 
         description = ?, 
         file_download = ?, 
         module_id = ?, 
         rich_text = ?, 
         type = ?, 
         video_url = ? 
       WHERE id = ?`,
      [title, description || null, file_download || null, module_id, rich_text || null, type, video_url || null, contentId]
    );

    // Limpar o cache após a atualização
    deleteCache(`content_${contentId}`);

    if (result.affectedRows === 0) {
      return new Response("Conteúdo não encontrado ou não atualizado", { status: 404 });
    }

    return new Response(JSON.stringify({ message: "Conteúdo atualizado com sucesso." }), { status: 200 });
  } catch (error) {
    console.error("Erro ao atualizar conteúdo:", error);
    return new Response("Erro ao atualizar conteúdo", { status: 500 });
  }
}
