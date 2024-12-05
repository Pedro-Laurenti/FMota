import { NextRequest, NextResponse } from "next/server";
import getConnection from "@/config/connection";
import { getOrSetCache, deleteCache } from "@/config/cache";

const ROWS_PER_PAGE = 10;

// **GET** - Listar módulos
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";

  if (isNaN(page) || page < 1) {
    return NextResponse.json(
      { error: "Parâmetro 'page' inválido. Deve ser um número maior que 0." },
      { status: 400 }
    );
  }

  const offset = (page - 1) * ROWS_PER_PAGE;

  try {
    const cacheKey = `modules_page_${page}_${search}`;
    const response = await getOrSetCache(cacheKey, async () => {
      const connection = await getConnection();

      // Conta o total de módulos
      const [countRows]: any = await connection.execute(
        `SELECT COUNT(*) as total 
         FROM modules 
         WHERE title LIKE ?`,
        [`%${search}%`]
      );
      const totalRows = countRows[0]?.total || 0;

      // Obtém a lista de módulos paginada
      const [rows]: any = await connection.execute(
        `SELECT id, title 
         FROM modules
         WHERE title LIKE ?
         ORDER BY id ASC
         LIMIT ? OFFSET ?`,
        [`%${search}%`, ROWS_PER_PAGE, offset]
      );

      return { count: totalRows, results: rows };
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao buscar módulos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar módulos" },
      { status: 500 }
    );
  }
}

// **POST** - Criar novo módulo
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title } = body;

  if (!title) {
    return new Response("Título do módulo é obrigatório", { status: 400 });
  }

  try {
    const connection = await getConnection();
    const [result]: any = await connection.execute(
      `INSERT INTO modules (title) VALUES (?)`,
      [title]
    );

    // Limpar cache após a criação
    await deleteCache(`modules_page_*`);

    return NextResponse.json(
      { id: result.insertId, title },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar módulo:", error);
    return new Response("Erro ao criar módulo", { status: 500 });
  }
}

// **DELETE** - Remover módulo
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = parseInt(searchParams.get("id") || "", 10);

  if (!id || isNaN(id)) {
    return NextResponse.json(
      { error: "ID inválido. Deve ser um número válido." },
      { status: 400 }
    );
  }

  try {
    const connection = await getConnection();
    const [result]: any = await connection.execute(
      "DELETE FROM modules WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Módulo não encontrado ou já excluído." },
        { status: 404 }
      );
    }

    // Limpa o cache após exclusão
    await deleteCache(`modules_page_*`);

    return NextResponse.json(
      { message: "Módulo excluído com sucesso." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao excluir módulo:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir módulo." },
      { status: 500 }
    );
  }
}
