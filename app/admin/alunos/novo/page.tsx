"use client";
import React, { useMemo, useState } from "react";
import {
  Input,
  Button,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  Select,
  SelectItem,
  Modal,
  ModalBody,
  ModalFooter,
  useModal,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";

export default function NovoAluno() {
  const [alunoData, setAlunoData] = useState({
    nome: "",
    email: "",
    tipo_usuario: "pendente",
    numero_contato: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [tokenLink, setTokenLink] = useState("");
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const { nome, email, numero_contato } = alunoData;
  const router = useRouter();

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(alunoData),
      });

      if (response.ok) {
        const data = await response.json();
        const link = `${process.env.NEXT_BASE_URL}/signin/reset-password?token=${data.token}`;
        setTokenLink(link);
        setIsTokenModalOpen(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erro ao adicionar aluno.");
      }
    } catch (err) {
      setError("Erro ao salvar as alterações.");
    } finally {
      setIsLoading(false);
    }
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
    setAlunoData({ ...alunoData, numero_contato: formattedNumber });
  };

  // Verifica se o número de telefone é válido
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

  // Validação de email
  const isInvalidEmail = useMemo(() => {
    return email && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email);
  }, [email]);


  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="p-6 w-full max-w-96">
        <CardHeader>
          <h2 className="text-2xl font-semibold">Adicionar Novo Aluno</h2>
        </CardHeader>
        <CardBody>
          {error && <div style={{ color: "red" }}>{error}</div>}
          <form onSubmit={handleSave}>
            <Input
              fullWidth
              label="Nome"
              value={nome}
              onChange={(e) => setAlunoData({ ...alunoData, nome: e.target.value })}
              className="mb-4"
            />
            <Input
              fullWidth
              label="Email"
              value={email}
              onChange={(e) => setAlunoData({ ...alunoData, email: e.target.value })}
              className="mb-4"
              isInvalid={hasTriedSubmit && isInvalidEmail ? true : undefined}
              errorMessage={
                hasTriedSubmit && isInvalidEmail ? "E-mail inválido" : ""
              }
            />
            
            {/* Select para o tipo de usuário */}
            <Select
              fullWidth
              label="Tipo de Usuário"
              value={alunoData.tipo_usuario}
              onChange={(e) => setAlunoData({ ...alunoData, tipo_usuario: e.target.value })}
              className="mb-4"
            >
              <SelectItem value="administrador" key="administrador">Administrador</SelectItem>
              <SelectItem value="assinante" key="assinante">Assinante</SelectItem>
              <SelectItem value="pendente" key="pendente">Pendente</SelectItem>
            </Select>

            <Input
              fullWidth
              label="Telefone"
              value={numero_contato}
              onChange={handlePhoneChange}
              className="mb-4"
              isInvalid={hasTriedSubmit && isInvalidPhoneNumber}
              errorMessage={
                hasTriedSubmit && isInvalidPhoneNumber
                  ? "Número de contato inválido"
                  : ""
              }
            />

            <Button type="submit" color="primary" isLoading={isLoading}>
              {isLoading ? <Spinner size="sm" /> : "Adicionar Aluno"}
            </Button>
          </form>
        </CardBody>
      </Card>

      <Modal isOpen={isTokenModalOpen} onClose={() => setIsTokenModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Link Gerado</ModalHeader>
          <ModalBody>
            <p>Link temporário gerado para criação de senha:</p>
            <Input
              readOnly
              value={tokenLink}
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onClick={() => {
                navigator.clipboard.writeText(tokenLink);
                setIsTokenModalOpen(false);
                router.push("/admin/alunos");
              }}
            >
              Copiar e Continuar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </div>
  );
}

