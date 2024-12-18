import { NextResponse } from "next/server";
import getConnection from "@/config/connection";
import { getOrSetCache } from "@/config/cache"; // Importe a função global

export async function GET() {
  try {
    // Define a chave do cache para essa consulta
    const cacheKey = "latest_users";

    // Chama a função global para pegar ou armazenar o cache
    const response = await getOrSetCache(cacheKey, async () => {
      // Caso não esteja no cache, consulta o banco de dados
      const connection = await getConnection();
      const [rows]: any = await connection.execute(`
        SELECT id, nome, email, tipo_usuario, data_criacao
        FROM usuarios
        ORDER BY data_criacao DESC
        LIMIT 20
      `);

      // Retorna os dados consultados
      return rows;
    });

    // Retorna os dados, já com o cache aplicado
    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
  }
}
