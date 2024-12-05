import { NextResponse } from "next/server";
import getConnection from "@/config/connection";
import { getOrSetCache } from "@/config/cache"; // Importe a função global

export async function GET() {
  try {
    const cacheKey = "earnings_summary";

    // Chama a função global para pegar ou armazenar o cache
    const response = await getOrSetCache(cacheKey, async () => {
      const connection = await getConnection();
      const [rows]: any = await connection.execute(`
        SELECT 
          DATE_FORMAT(data_criacao, '%Y-%m') AS periodo, 
          SUM(valor) AS total
        FROM assinaturas
        WHERE status = 'ativa'
        GROUP BY periodo
        ORDER BY periodo
      `);

      const labels = rows.map((row: any) => row.periodo);
      const data = rows.map((row: any) => row.total);

      return { labels, data };
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao buscar ganhos:", error);
    return NextResponse.json({ error: "Erro ao buscar ganhos" }, { status: 500 });
  }
}
