import createConnection from "@/config/connection";

export async function GET(req: Request) {
  try {
    // Conectar ao banco de dados
    const connection = await createConnection();

    // Buscar todos os módulos com seus respectivos conteúdos
    const [modulesRows]: any = await connection.execute(
      `SELECT m.id AS module_id, m.title AS module_title,
              c.id AS content_id, c.title AS content_title, c.description, c.type
       FROM modules m
       LEFT JOIN contents c ON m.id = c.module_id`
    );

    // Organizar os dados na estrutura esperada
    const modules = [];
    let currentModule = null;

    for (const row of modulesRows) {
      if (currentModule?.id !== row.module_id) {
        // Novo módulo encontrado, adiciona o anterior, se houver
        if (currentModule) modules.push(currentModule);
        
        // Cria um novo módulo
        currentModule = {
          id: row.module_id,
          title: row.module_title,
          contents: []
        };
      }

      // Adiciona o conteúdo ao módulo
      (currentModule as any).contents.push({
        id: row.content_id,
        title: row.content_title,
        description: row.description,
        type: row.type,
      });
    }

    // Adiciona o último módulo, se houver
    if (currentModule) modules.push(currentModule);

    return new Response(JSON.stringify(modules), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Erro ao buscar módulos:", error);
    return new Response(JSON.stringify({ error: "Erro ao recuperar os módulos" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
