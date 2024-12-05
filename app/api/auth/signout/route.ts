import { getOrSetCache } from "@/config/cache"; // Função global de cache

export async function POST(req: Request) {
  const cookies = req.headers.get("cookie") || "";
  const token = cookies
    .split(";")
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith("authToken="))
    ?.split("=")[1];

  if (token) {
    // Armazena o token em uma blacklist temporária usando cache local
    const blacklistKey = `blacklist_${token}`;
    await getOrSetCache(blacklistKey, async () => {
      return "1"; // Marca o token como inválido
    });

    // Define um tempo de expiração para a blacklist
    await getOrSetCache(blacklistKey, async () => {
      return "1";
    });
  }

  // Configura os cookies como expirados
  const headers = new Headers({
    "Set-Cookie": [
      `authToken=; HttpOnly; Secure; Path=/; Max-Age=0`,
      `stripe_customer_id=; Secure; Path=/; Max-Age=0`,
      `internal_user_id=; Secure; Path=/; Max-Age=0`,
    ].join(", "),
    "Content-Type": "application/json",
  });

  return new Response(
    JSON.stringify({ message: "Usuário desconectado com sucesso" }),
    { status: 200, headers },
  );
}
