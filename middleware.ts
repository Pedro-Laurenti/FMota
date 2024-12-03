import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('authToken')?.value;

  if (!token) {
    return NextResponse.redirect(new URL('/signin', req.url));
  }

  try {
    const secretKey = process.env.TOKEN_SECRET_KEY;
    if (!secretKey) throw new Error("TOKEN_SECRET_KEY não definida no ambiente");

    await jwtVerify(token, new TextEncoder().encode(secretKey));
    return NextResponse.next();
  } catch (error) {
    console.error("Erro na verificação do token:", error);
    return NextResponse.redirect(new URL('/signin', req.url));
  }
}

export const config = {
  matcher: ['/dashboard', '/checkout']
};

