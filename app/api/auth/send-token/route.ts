import bcrypt from "bcrypt";
import createConnection from "@/config/connection";
import nodemailer from "nodemailer"; // Biblioteca para envio de e-mails

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email) {
    return new Response(JSON.stringify({ error: "Email é obrigatório" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Gerar o token e definir o tempo de expiração
  const token = Math.floor(100000 + Math.random() * 900000).toString(); // Código de 6 dígitos
  const hashedToken = await bcrypt.hash(token, 10);
  const expiryTime = Date.now() + 15 * 60 * 1000; // Expira em 15 minutos

  let connection;
  try {
    connection = await createConnection();

    // Atualiza o banco de dados com o token de redefinição de senha
    const [result]: any = await connection.execute(
      `UPDATE usuarios SET reset_token = ?, reset_token_expiry = ? WHERE email = ?`,
      [hashedToken, expiryTime, email],
    );

    console.log("Linhas afetadas:", result.affectedRows); // Acessando `affectedRows`

    // Configuração do transportador de e-mail
    const transporter = nodemailer.createTransport(
      {
        host: process.env.SMTP_HOST!,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
          user: process.env.SMTP_USER!,
          pass: process.env.SMTP_PASS!,
        },
      },
      {
        logger: true, // Habilita logs detalhados
        debug: true,  // Ativa depuração
      }
    );

    // Enviar e-mail com o token de recuperação
    try {
      const info = await transporter.sendMail({
        from: process.env.SMTP_FROM!,
        to: email,
        subject: "Código de recuperação de senha",
        text: `Seu código de recuperação de senha é: ${token}`,
      });

      console.log("Mensagem enviada: %s", info.messageId); // Log de sucesso
    } catch (emailError) {
      console.error("Erro ao enviar e-mail:", emailError);
    }

    return new Response(
      JSON.stringify({
        message: "Código de recuperação enviado para o e-mail",
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("Erro ao enviar token de recuperação:", error);
    return new Response(JSON.stringify({ error: "Erro no servidor" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}
