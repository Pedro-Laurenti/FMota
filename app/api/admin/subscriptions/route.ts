import { NextResponse } from "next/server";
import getConnection from "@/config/connection";
import { getOrSetCache } from "@/config/cache"; // Importe a função global

export async function GET() {
  try {
    // Define a chave do cache para essa consulta
    const cacheKey = "subscriptions_by_month";

    // Chama a função global para pegar ou armazenar o cache
    const response = await getOrSetCache(cacheKey, async () => {
      // Caso não esteja no cache, consulta o banco de dados
      console.log("Dados não encontrados no cache, consultando o banco...");
      const connection = await getConnection();
      const [rows]: any = await connection.execute(`
        SELECT 
          DATE_FORMAT(data_criacao, '%Y-%m') AS periodo, 
          COUNT(*) AS total
        FROM assinaturas
        GROUP BY periodo
        ORDER BY periodo
      `);

      // Processa os dados e estrutura a resposta
      const labels = rows.map((row: any) => row.periodo);
      const data = rows.map((row: any) => row.total);

      return { labels, data };
    });

    // Retorna os dados, já com o cache aplicado
    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao buscar inscrições:", error);
    return NextResponse.json({ error: "Erro ao buscar inscrições" }, { status: 500 });
  }
}
