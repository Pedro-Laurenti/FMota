"use client";
import React, { useState } from "react";
import {
  Input,
  Button,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  Modal,
  ModalBody,
  ModalFooter,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { useRouter } from "next/navigation";

export default function NovoModulo() {
  const [moduloData, setModuloData] = useState({
    title: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const { title } = moduloData;
  const router = useRouter();

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/modulos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(moduloData),
      });

      if (response.ok) {
        setIsSuccessModalOpen(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erro ao adicionar módulo.");
      }
    } catch (err) {
      setError("Erro ao salvar as alterações.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="p-6 w-full max-w-96">
        <CardHeader>
          <h2 className="text-2xl font-semibold">Adicionar Novo Módulo</h2>
        </CardHeader>
        <CardBody>
          {error && <div style={{ color: "red" }}>{error}</div>}
          <form onSubmit={handleSave}>
            <Input
              fullWidth
              label="Título do Módulo"
              value={title}
              onChange={(e) => setModuloData({ ...moduloData, title: e.target.value })}
              className="mb-4"
            />

            <Button type="submit" color="primary" isLoading={isLoading}>
              {isLoading ? <Spinner size="sm" /> : "Adicionar Módulo"}
            </Button>
          </form>
        </CardBody>
      </Card>

      <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Módulo Criado</ModalHeader>
          <ModalBody>
            <p>O módulo foi criado com sucesso!</p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onClick={() => {
                setIsSuccessModalOpen(false);
                router.push("/admin/modulos");
              }}
            >
              Voltar para a lista
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
