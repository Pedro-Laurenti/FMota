"use client";
import { useState, useEffect } from "react";
import { Card, CardBody, Button, Input } from "@nextui-org/react";

export default function PasswordRecovery() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isTokenSent, setIsTokenSent] = useState(false);
  const [isPasswordReset, setIsPasswordReset] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);  // Estado de carregamento

  useEffect(() => {
    let timer: string | number | NodeJS.Timeout | undefined;
    if (cooldown > 0) {
      timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSendToken = async () => {
    if (cooldown > 0) {
      setError("Aguarde antes de reenviar o token.");
      return;
    }

    try {
      setIsLoading(true);  // Ativa o carregamento
      setIsButtonDisabled(true);
      const response = await fetch("/api/auth/send-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      setMessage(data.message);
      setIsTokenSent(true);
      setCooldown(60); // Definir 1 minuto de espera para reenvio
    } catch (error: any) {
      setError(error.message || "Erro ao enviar token");
    } finally {
      setIsLoading(false);  // Desativa o carregamento
      setTimeout(() => setIsButtonDisabled(false), 5000); // 5 segundos de espera para evitar spam
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }

    try {
      setIsLoading(true);  // Ativa o carregamento
      const response = await fetch("/api/auth/reset-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, token, newPassword }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setMessage(data.message);
      setIsPasswordReset(true);
      setIsTokenSent(false);
    } catch (error: any) {
      setError(error.message || "Erro ao redefinir senha");
    } finally {
      setIsLoading(false);  // Desativa o carregamento
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full md:w-96">
        <CardBody>
          <h2 className="text-2xl font-bold mb-4 text-center">
            {isPasswordReset
              ? "Senha Redefinida com Sucesso!"
              : "Recuperação de Senha"}
          </h2>

          {error && <p className="text-red-500">{error}</p>}
          {message && <p className="text-green-500">{message}</p>}

          {isPasswordReset ? (
            <div className="text-center">
              <p className="text-lg">Sua senha foi redefinida com sucesso.</p>
              <Button
                color="primary"
                onPress={() => (window.location.href = "/signin")}
                className="mt-4"
              >
                Ir para o Login
              </Button>
            </div>
          ) : !isTokenSent ? (
            <div className="space-y-4">
              <Input
                label="Email"
                variant="bordered"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
              />
              <Button
                onPress={handleSendToken}
                color="primary"
                fullWidth
                disabled={isButtonDisabled || cooldown > 0}
                isLoading={isLoading}  // Indicador de carregamento
              >
                {cooldown > 0
                  ? `Aguarde ${cooldown}s`
                  : "Enviar Código de Recuperação"}
              </Button>
            </div>
          ) : (
            <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
              <Input
                label="Código de Recuperação"
                variant="bordered"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                fullWidth
              />
              <Input
                label="Nova Senha"
                variant="bordered"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                fullWidth
              />
              <Input
                label="Confirmar Nova Senha"
                variant="bordered"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                fullWidth
              />
              <Button
                onPress={handleResetPassword}
                color="primary"
                fullWidth
                isLoading={isLoading}  // Indicador de carregamento
              >
                Redefinir Senha
              </Button>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
