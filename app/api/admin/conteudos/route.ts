import { NextRequest, NextResponse } from "next/server";
import getConnection from "@/config/connection";
import { getOrSetCache, deleteCache } from "@/config/cache";

const ROWS_PER_PAGE = 10;

// **GET** - Listar conteúdos
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";
  const moduleId = parseInt(searchParams.get("module_id") || "0", 10);

  if (isNaN(page) || page < 1) {
    return NextResponse.json(
      { error: "Parâmetro 'page' inválido. Deve ser um número maior que 0." },
      { status: 400 }
    );
  }

  if (moduleId && isNaN(moduleId)) {
    return NextResponse.json(
      { error: "Parâmetro 'module_id' inválido. Deve ser um número válido." },
      { status: 400 }
    );
  }

  const offset = (page - 1) * ROWS_PER_PAGE;

  try {
    const cacheKey = `contents_page_${page}_${search}_${moduleId}`;
    const response = await getOrSetCache(cacheKey, async () => {
      const connection = await getConnection();

      // Conta o total de conteúdos
      const [countRows]: any = await connection.execute(
        `SELECT COUNT(*) as total 
         FROM contents 
         WHERE title LIKE ? AND (? = 0 OR module_id = ?)`,
        [`%${search}%`, moduleId, moduleId]
      );
      const totalRows = countRows[0]?.total || 0;

      // Obtém a lista de conteúdos paginada
      const [rows]: any = await connection.execute(
        `SELECT id, title, description, file_download, video_url, type 
         FROM contents
         WHERE title LIKE ? AND (? = 0 OR module_id = ?)
         ORDER BY id ASC
         LIMIT ? OFFSET ?`,
        [`%${search}%`, moduleId, moduleId, ROWS_PER_PAGE, offset]
      );

      return { count: totalRows, results: rows };
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao buscar conteúdos:", error);
    return NextResponse.json(
      { error: "Erro ao buscar conteúdos" },
      { status: 500 }
    );
  }
}

// **POST** - Criar novo conteúdo
export async function POST(req: NextRequest) {
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
      `INSERT INTO contents (title, description, file_download, module_id, rich_text, type, video_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [title, description || null, file_download || null, module_id, rich_text || null, type, video_url || null]
    );

    // Limpar cache após a criação
    await deleteCache(`contents_page_*`);

    return NextResponse.json(
      { id: result.insertId, title },
      { status: 201 }
    );
  } catch (error) {
    console.error("Erro ao criar conteúdo:", error);
    return new Response("Erro ao criar conteúdo", { status: 500 });
  }
}

// **DELETE** - Remover conteúdo
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
      "DELETE FROM contents WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Conteúdo não encontrado ou já excluído." },
        { status: 404 }
      );
    }

    // Limpa o cache após exclusão
    await deleteCache(`contents_page_*`);

    return NextResponse.json(
      { message: "Conteúdo excluído com sucesso." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao excluir conteúdo:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir conteúdo." },
      { status: 500 }
    );
  }
}
