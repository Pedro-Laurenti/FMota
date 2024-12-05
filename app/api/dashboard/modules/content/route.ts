import getConnection from "@/config/connection";
import { NextRequest } from "next/server";
import { setCache, getCache } from "@/config/cache"; // Funções de cache para IndexedDB

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get("moduleId");
  const contentId = searchParams.get("contentId");

  if (!moduleId || !contentId) {
    return new Response("Parâmetros inválidos", { status: 400 });
  }

  try {
    // Verificar se os dados estão no cache
    const cacheKey = `content_${moduleId}_${contentId}`;
    const cachedContent = await getCache(cacheKey);

    if (cachedContent) {
      console.log(`Conteúdo encontrado no cache para moduleId: ${moduleId}, contentId: ${contentId}`);
      return new Response(cachedContent, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Conectar ao banco de dados
    const connection = await getConnection();

    const [rows]: any = await connection.execute(
      `SELECT c.title, c.description, c.type, 
              IFNULL(c.rich_text, '') AS rich_text, 
              IFNULL(c.video_url, '') AS video_url, 
              IFNULL(c.file_download, '') AS file_download
       FROM contents c
       WHERE c.module_id = ? AND c.id = ?`,
      [moduleId, contentId]
    );

    if (rows.length === 0) {
      return new Response("Conteúdo não encontrado", { status: 404 });
    }

    const content = rows[0];

    // Armazenar os dados no cache
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
