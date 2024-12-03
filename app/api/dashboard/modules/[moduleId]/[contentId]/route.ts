import createConnection from "@/config/connection";

export async function GET(req: Request, { params }: { params: { moduleId: string; contentId: string } }) {
  const { moduleId, contentId } = params;

  try {
    // Conectar ao banco de dados
    const connection = await createConnection();

    // Buscar o conteúdo específico pelo moduleId e contentId
    const [rows]: any = await connection.execute(
      `SELECT c.title, c.description, c.type, 
              IFNULL(c.rich_text, '') AS rich_text, 
              IFNULL(c.video_url, '') AS video_url, 
              IFNULL(c.file_download, '') AS file_download
       FROM contents c
       WHERE c.module_id = ? AND c.id = ?`,
      [moduleId, contentId]
    );
    

    console.log("Dados retornados do banco:", rows); // Log para verificar os dados

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
