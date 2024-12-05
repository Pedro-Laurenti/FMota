"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input, Button, Card, CardBody, CardHeader, Spinner } from "@nextui-org/react";
import { IoEye, IoEyeOff } from "react-icons/io5";
import { Suspense } from 'react';

function ResetPasswordPage() {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const searchParams = useSearchParams(); // Hook para acessar os parâmetros
  const router = useRouter();

  const { password, confirmPassword } = formData;

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setError("Token não encontrado na URL.");
    }
  }, [searchParams]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleVisibility = () => setIsVisible((prev) => !prev);

  const handleReset = async () => {
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    const token = searchParams.get("token");

    if (!token) {
      setError("Token inválido.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || "Erro ao redefinir a senha.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/signin");
      }, 2000); // Redireciona após 2 segundos
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (success) return <p>Senha redefinida com sucesso! Redirecionando...</p>;

  return (
    <div className="w-full flex justify-center items-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="text-2xl text-primary">Redefinir Senha</h1>
        </CardHeader>
        <CardBody>
          {error && <p style={{ color: "red" }}>{error}</p>}
          <Input
            type={isVisible ? "text" : "password"}
            label="Nova Senha"
            name="password"
            value={password}
            onChange={handleChange}
            endContent={
              <button
                className="h-full"
                type="button"
                onClick={toggleVisibility}
                aria-label="toggle password visibility"
              >
                {isVisible ? <IoEyeOff /> : <IoEye />}
              </button>
            }
            variant="bordered"
            className="mb-4"
          />
          <Input
            type={isVisible ? "text" : "password"}
            label="Confirmar Nova Senha"
            name="confirmPassword"
            value={confirmPassword}
            onChange={handleChange}
            isInvalid={password !== confirmPassword && confirmPassword.length > 0}
            errorMessage={
              password !== confirmPassword && confirmPassword.length > 0
                ? "Senhas não coincidem"
                : undefined
            }
            variant="bordered"
            className="mb-4"
          />
          <Button onClick={handleReset} color="primary" fullWidth>
            Redefinir Senha
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<Spinner />}>
      <ResetPasswordPage />
    </Suspense>
  );
}