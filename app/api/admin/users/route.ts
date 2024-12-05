import { NextRequest, NextResponse } from "next/server";
import getConnection from "@/config/connection";
import { getOrSetCache, deleteCache } from "@/config/cache";
import { randomBytes } from "crypto";
import { format } from "date-fns"; 

const ROWS_PER_PAGE = 10;


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const search = searchParams.get("search") || "";  // Obtém o parâmetro de pesquisa, se houver

  if (isNaN(page) || page < 1) {
    return NextResponse.json(
      { error: "Parâmetro 'page' inválido. Deve ser um número maior que 0." },
      { status: 400 }
    );
  }

  const offset = (page - 1) * ROWS_PER_PAGE;

  try {
    // Definindo a chave de cache com base na pesquisa também, para evitar cache errado
    const cacheKey = `users_page_${page}_${search}`;
    const response = await getOrSetCache(cacheKey, async () => {
      const connection = await getConnection();

      // Contando os usuários com base no filtro de pesquisa (caso haja)
      const [countRows]: any = await connection.execute(`
        SELECT COUNT(*) as total 
        FROM usuarios 
        WHERE nome LIKE ?`, 
        [`%${search}%`]);  // Usando LIKE para busca parcial no nome

      const totalRows = countRows[0]?.total || 0;

      // Selecionando os usuários com base no filtro de pesquisa
      const [rows]: any = await connection.execute(`
        SELECT id, nome, email, tipo_usuario, data_criacao
        FROM usuarios
        WHERE nome LIKE ?
        ORDER BY data_criacao DESC
        LIMIT ? OFFSET ?`, 
        [`%${search}%`, ROWS_PER_PAGE, offset]);  // Usando LIKE para pesquisa no nome

      return { count: totalRows, results: rows };
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}

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
      "DELETE FROM usuarios WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { error: "Usuário não encontrado ou já excluído." },
        { status: 404 }
      );
    }

    // Invalida o cache da página com os usuários, pois a exclusão afeta a listagem
    await deleteCache(`users_page_*`);

    return NextResponse.json(
      { message: "Usuário excluído com sucesso." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erro ao excluir usuário:", error);
    return NextResponse.json(
      { error: "Erro interno ao excluir o usuário." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { nome, email, tipo_usuario, numero_contato } = body;

  if (!nome || !email || !tipo_usuario || !numero_contato) {
    return new Response("Dados incompletos para criação", { status: 400 });
  }

  try {
    const connection = await getConnection();

    // Criação do usuário
    const [result]: any = await connection.execute(
      `INSERT INTO usuarios (nome, email, tipo_usuario, numero_contato)
       VALUES (?, ?, ?, ?)`,
      [nome, email, tipo_usuario, numero_contato]
    );

    const userId = result.insertId;

    // Gerar token temporário
    const token = randomBytes(32).toString("hex");
    const expirationDate = format(new Date(Date.now() + 24 * 60 * 60 * 1000), "yyyy-MM-dd HH:mm:ss");

    // Armazenar o token e validade no banco de dados
    await connection.execute(
      `INSERT INTO senha_temp_tokens (user_id, token, validade)
       VALUES (?, ?, ?)`,
      [userId, token, expirationDate]
    );

    const newUser = {
      id: userId,
      nome,
      email,
      tipo_usuario,
      numero_contato,
      token, // Retorna o token gerado
      expiration: expirationDate,
    };

    // Limpa o cache
    await deleteCache('users_page_*');

    return new Response(JSON.stringify(newUser), { status: 201 });
  } catch (error) {
    console.error("Erro ao adicionar usuário:", error);
    return new Response("Erro ao adicionar usuário", { status: 500 });
  }
}