import createConnection from "@/config/connection";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const moduleId = searchParams.get("moduleId");
  const contentId = searchParams.get("contentId");

  if (!moduleId || !contentId) {
    return new Response("Parâmetros inválidos", { status: 400 });
  }

  try {
    // Conectar ao banco de dados
    const connection = await createConnection();

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
