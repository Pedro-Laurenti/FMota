"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Input,
  Button,
  Textarea,
  Select,
  SelectItem,
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
import SimpleRichTextEditor from "@/components/inputRich";

export default function ConteudoDetalhes() {
  const { id } = useParams();
  const [conteudoData, setConteudoData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEditable, setIsEditable] = useState<boolean>(false); // Novo estado para edição
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [modules, setModules] = useState<typeof SelectItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      fetch(`/api/admin/conteudos/id?id=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setConteudoData(data);
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Erro ao carregar dados do conteúdo:", error);
          setIsLoading(false);
        });
    }
  }, [id]);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch("/api/admin/modulos");
        const data = await response.json();
        setModules(data.results || []); // Armazena os módulos retornados como SelectItems
      } catch (err) {
        console.error("Erro ao buscar módulos:", err);
      }
    };

    fetchModules();
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();

    const updatedConteudo = {
      title: conteudoData.title,
      description: conteudoData.description,
      file_download: conteudoData.file_download,
      video_url: conteudoData.video_url,
      rich_text: conteudoData.rich_text,
      type: conteudoData.type,
      module_id: conteudoData.module_id,
    };

    try {
      const response = await fetch(`/api/admin/conteudos/id?id=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedConteudo),
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
    router.push("/admin/conteudos");
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="p-6 w-full max-w-2xl relative">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Detalhes do Conteúdo</h2>
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
          {conteudoData ? (
            <form onSubmit={handleSave}>
              <Input
                fullWidth
                unselectable="on"
                readOnly
                label="ID"
                value={conteudoData.id ?? ""}
                className="mb-4"
              />
              <Input
                fullWidth
                isDisabled={!isEditable}
                label="Título"
                value={conteudoData.title ?? ""}
                onChange={(e) => setConteudoData({ ...conteudoData, title: e.target.value })}
                className="mb-4"
              />
              <Textarea
                fullWidth
                isDisabled={!isEditable}
                label="Descrição"
                value={conteudoData.description}
                onChange={(e) => setConteudoData({ ...conteudoData, description: e.target.value })}
                className="mb-4"
              />
              <Input
                fullWidth
                isDisabled={!isEditable}
                label="URL do Arquivo para Download"
                value={conteudoData.file_download ?? ""}
                onChange={(e) => setConteudoData({ ...conteudoData, file_download: e.target.value })}
                className="mb-4"
              />
              <Input
                fullWidth
                isDisabled={!isEditable}
                label="URL do Vídeo"
                value={conteudoData.video_url ?? ""}
                onChange={(e) => setConteudoData({ ...conteudoData, video_url: e.target.value })}
                className="mb-4"
              />

              {/* Editor de Texto Rico */}
              <SimpleRichTextEditor
                value={conteudoData.rich_text}
                onChange={(html) => setConteudoData({ ...conteudoData, rich_text: html })}
                placeholder="Digite o conteúdo aqui..."
                title="Texto principal"
                isDisabled={!isEditable}
              />

              {/* SelectBox para Módulo */}
              <Select
                label="Selecione o Módulo"
                selectedKeys={conteudoData?.module_id ? [conteudoData.module_id.toString()] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0];
                  setConteudoData({ 
                    ...conteudoData, 
                    module_id: selectedKey ? Number(selectedKey) : null 
                  });
                }}
                isDisabled={!isEditable}
                className="mb-4"
                required
              >
                {modules.map((module: any) => (
                  <SelectItem key={module.id.toString()} value={module.id.toString()}>
                    {module.title}
                  </SelectItem>
                ))}
              </Select>

              <Select
                label="Tipo do Conteúdo"
                selectedKeys={conteudoData?.type ? [conteudoData.type] : []}
                onSelectionChange={(keys) => {
                  const selectedKey = Array.from(keys)[0];
                  setConteudoData({ 
                    ...conteudoData, 
                    type: selectedKey ? selectedKey.toString() : '' 
                  });
                }}
                isDisabled={!isEditable}
                className="mb-4"
                required
              >
                <SelectItem key="record" value="record">
                  Vídeo
                </SelectItem>
                <SelectItem key="archive" value="archive">
                  Arquivo
                </SelectItem>
                <SelectItem key="text" value="text">
                  Texto
                </SelectItem>
              </Select>

              {isEditable ? (
                <Button type="submit" color="primary" className="mt-4 w-full">
                  Salvar Alterações
                </Button>
              ) : (
                <Link href="/admin/conteudos" className="w-full">
                  <Button type="button" color="primary" className="mt-4 w-full">
                    Voltar
                  </Button>
                </Link>
              )}
            </form>
          ) : (
            <>
              <p className="font-semibold text-danger">Conteúdo não encontrado.</p>
              <Link href="/admin/conteudos">
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
          <ModalHeader>Conteúdo Atualizado</ModalHeader>
          <ModalBody>
            <p>O conteúdo foi atualizado com sucesso!</p>
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
