import getConnection from "@/config/connection";
import { setCache, getCache } from "@/config/cache"; // Funções de cache para IndexedDB ou alternativas

export async function GET(req: Request) {
  try {
    // Verificar no cache local se a lista de módulos e conteúdos já está em cache
    const cacheKey = "modules_and_contents";
    const cachedModules = await getCache(cacheKey);

    if (cachedModules) {
      // Se os dados estiverem no cache, retorna diretamente
      return new Response(cachedModules, {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Conectar ao banco de dados
    const connection = await getConnection();

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

    // Armazenar os dados no cache local por 1 hora (3600 segundos)
    await setCache(cacheKey, JSON.stringify(modules)); // Cache expirando em 1 hora

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
