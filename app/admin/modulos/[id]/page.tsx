"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Input,
  Button,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  Link,
  Modal,
  ModalBody,
  ModalFooter,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import { IoPencilOutline } from "react-icons/io5"; // Ícone de caneta
import { useRouter } from "next/navigation";

export default function ModuloDetalhes() {
  const { id } = useParams();
  const [moduloData, setModuloData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditable, setIsEditable] = useState<boolean>(false); // Novo estado para edição
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      fetch(`/api/admin/modulos/id?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setModuloData(data);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Erro ao carregar dados do módulo:", error);
          setIsLoading(false);
        });
    }
  }, [id]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    const updatedModulo = {
      title: moduloData.title,
    };

    try {
      const response = await fetch(`/api/admin/modulos/id?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedModulo),
      });

      if (response.ok) {
        setIsSuccessModalOpen(true);
      } else {
        const errorData = await response.json();
        console.error("Erro ao salvar:", errorData);
      }
    } catch (error) {
      console.error("Erro ao salvar as alterações:", error);
    }
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    router.push("/admin/modulos");
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="p-6 w-full max-w-96 relative">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Detalhes do Módulo</h2>
          {/* Botão de alternância para edição */}
          <Button
            isIconOnly
            color={isEditable ? "success" : "default"}
            onPress={() => setIsEditable(!isEditable)}
            className="absolute top-2 right-2"
          >
            <IoPencilOutline size={24} />
          </Button>
        </CardHeader>
        <CardBody>
          {moduloData ? (
            <form onSubmit={handleSave}>
              <Input
                fullWidth
                unselectable="on"
                readOnly
                label="ID"
                value={moduloData.id}
                onChange={(e) => setModuloData({ ...moduloData, id: e.target.value })}
                className="mb-4"
              />
              <Input
                fullWidth
                isDisabled={!isEditable}
                label="Título"
                value={moduloData.title}
                onChange={(e) => setModuloData({ ...moduloData, title: e.target.value })}
                className="mb-4"
              />

              {isEditable ? (
                <Button type="submit" color="primary" className="mt-4 w-full">
                  Salvar Alterações
                </Button>
              ) : (
                <Link href="/admin/modulos" className="w-full">
                  <Button type="button" color="primary" className="mt-4 w-full">
                    Voltar
                  </Button>
                </Link>
              )}
            </form>
          ) : (
            <>
              <p className="font-semibold text-danger">Módulo não encontrado.</p>
              <Link href="/admin/modulos">
                <Button type="button" color="primary" className="mt-4">
                  Voltar
                </Button>
              </Link>
            </>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={isSuccessModalOpen} onClose={handleCloseSuccessModal}>
        <ModalContent>
          <ModalHeader>Módulo Atualizado</ModalHeader>
          <ModalBody>
            <p>O módulo foi atualizado com sucesso!</p>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={handleCloseSuccessModal}>
              Voltar para a lista
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
