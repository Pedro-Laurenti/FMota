export async function POST() {
  // Configura os cookies como expirados
  const headers = new Headers({
    "Set-Cookie": [
      `authToken=; HttpOnly; Secure; Path=/; Max-Age=0`,
      `stripe_customer_id=; Secure; Path=/; Max-Age=0`,
      `internal_user_id=; Secure; Path=/; Max-Age=0`,
    ].join(", "),
    "Content-Type": "application/json",
  });
  

  return new Response(JSON.stringify({ message: "Usuário desconectado com sucesso" }), {
    status: 200,
    headers,
  });
}
