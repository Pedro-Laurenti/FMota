"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  Link,
} from "@nextui-org/react";
import { IoEye, IoEyeOff } from "react-icons/io5";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmSenha: "",
    numero_contato: "",
  });
  const [isVisible, setIsVisible] = useState(false);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const { nome, email, senha, confirmSenha, numero_contato } = formData;

  const handleChange = (e: { target: { name: any; value: any; }; }) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Formata o número de contato em tempo real
  const formatPhoneNumber = (value: string) => {
    return value
      .replace(/\D/g, "") // Remove todos os caracteres não-numéricos
      .replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3") // Aplica a máscara progressivamente
      .slice(0, 15); // Limita a 15 caracteres
  };

  const handlePhoneChange = (e: { target: { value: any; }; }) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, numero_contato: formattedNumber });
  };

  const handleSignup = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    setHasTriedSubmit(true);
    setError("");
  
    if (senha !== confirmSenha || isInvalidPhoneNumber || isInvalidEmail) {
      setError("Por favor, corrija os campos inválidos.");
      return;
    }
  
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
  
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome,
          email,
          senha,
          tipo_usuario: "pendente",
          numero_contato,
        }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.error || "Erro no servidor");
        return;
      }
  
      // Redirect to /checkout page
      router.push("/checkout");
    } catch (error) {
      console.error("Erro ao conectar-se ao servidor", error);
    } finally {
      setLoading(false);
    }
  };
  
  

  const isInvalidPhoneNumber = useMemo(() => {
    const invalidNumbers = [
      "(00) 00000-0000",
      "(11) 11111-1111",
      "(22) 22222-2222",
    ];
    return (
      numero_contato.length !== 15 || invalidNumbers.includes(numero_contato)
    );
  }, [numero_contato]);

  const isInvalidEmail = useMemo(() => {
    return email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
  }, [email]);

  const toggleVisibility = () => setIsVisible((prev) => !prev);

  return (
    <div className="flex items-center justify-center">
      <Card className="w-full md:w-96">
        <CardBody>
          <CardHeader>
            <h2 className="text-2xl font-bold mb-6 text-center">Criar Conta</h2>
          </CardHeader>
          {error && <div style={{ color: "red" }}>{error}</div>}
          <form onSubmit={handleSignup} className="space-y-4">
            <Input
              name="nome"
              value={nome}
              onChange={handleChange}
              label="Nome"
              variant="bordered"
              required
            />
            <Input
              name="email"
              value={email}
              onChange={handleChange}
              label="Email"
              variant="bordered"
              isInvalid={hasTriedSubmit && isInvalidEmail ? true : undefined}
              errorMessage={
                hasTriedSubmit && isInvalidEmail ? "E-mail inválido" : ""
              }
              required
            />

            <Input
              name="numeroContato"
              label="Número de Contato"
              variant="bordered"
              value={numero_contato}
              onChange={handlePhoneChange}
              isInvalid={hasTriedSubmit && isInvalidPhoneNumber}
              errorMessage={
                hasTriedSubmit && isInvalidPhoneNumber
                  ? "Número de contato inválido"
                  : ""
              }
              required
            />

            <Input
              name="senha"
              value={senha}
              onChange={handleChange}
              label="Senha"
              type={isVisible ? "text" : "password"}
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
            />
            <Input
              name="confirmSenha"
              value={confirmSenha}
              onChange={handleChange}
              label="Confirmar Senha"
              type={isVisible ? "text" : "password"}
              isInvalid={hasTriedSubmit && senha !== confirmSenha}
              errorMessage={
                hasTriedSubmit && senha !== confirmSenha
                  ? "Senhas não coincidem"
                  : ""
              }
              variant="bordered"
            />
            <Button type="submit" disabled={loading} color="primary" fullWidth>
              {loading ? "Carregando..." : "Criar Conta"}
            </Button>
          </form>
          <Divider className="my-8" />
          <div className="text-sm text-gray-600 text-center">
            Já possui uma conta? <Link href="/signin">Entrar</Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
