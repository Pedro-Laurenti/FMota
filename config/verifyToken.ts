import { jwtVerify } from 'jose';

export async function verifyToken(token: string | undefined) {
  if (!token) {
    throw new Error("Token não fornecido");
  }

  const secretKey = process.env.TOKEN_SECRET_KEY;
  if (!secretKey) throw new Error("TOKEN_SECRET_KEY não definida no ambiente");

  return await jwtVerify(token, new TextEncoder().encode(secretKey));
}
