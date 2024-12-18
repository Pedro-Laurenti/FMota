"use client";

import React, { useState, useEffect } from "react";
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
  Modal,
  ModalBody,
  ModalFooter,
  ModalContent,
  ModalHeader,
} from "@nextui-org/react";
import ReactQuill from "react-quill"; // Importando React Quill
import "react-quill/dist/quill.snow.css"; // Estilos para o editor
import { useRouter } from "next/navigation";
import SimpleRichTextEditor from "@/components/inputRich";

export default function NovoConteudo() {
  const [conteudoData, setConteudoData] = useState({
    title: "",
    description: "",
    file_download: "",
    module_id: "",
    rich_text: "",
    type: "",
    video_url: "",
  });
  const [modules, setModules] = useState([]); // Estado para armazenar módulos
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const router = useRouter();

  // Buscar módulos ao carregar a página
  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await fetch("/api/admin/modulos");
        const data = await response.json();
        setModules(data.results || []); // Armazena os módulos retornados
      } catch (err) {
        console.error("Erro ao buscar módulos:", err);
        setError("Erro ao carregar os módulos.");
      }
    };

    fetchModules();
  }, []);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    const { title, type, module_id } = conteudoData;
    if (!title || !type || !module_id) {
      setError("Os campos Título, Tipo e Módulo são obrigatórios.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/conteudos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(conteudoData),
      });

      if (response.ok) {
        setIsSuccessModalOpen(true);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erro ao adicionar conteúdo.");
      }
    } catch (err) {
      setError("Erro ao salvar as alterações.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="p-6 w-full max-w-2xl">
        <CardHeader>
          <h2 className="text-2xl font-semibold">Adicionar Novo Conteúdo</h2>
        </CardHeader>
        <CardBody>
          {error && <div style={{ color: "red", marginBottom: "1rem" }}>{error}</div>}
          <form onSubmit={handleSave}>
            <Input
              fullWidth
              label="Título do Conteúdo"
              value={conteudoData.title}
              onChange={(e) => setConteudoData({ ...conteudoData, title: e.target.value })}
              className="mb-4"
              required
            />
            <Textarea
              fullWidth
              label="Descrição"
              value={conteudoData.description}
              onChange={(e) => setConteudoData({ ...conteudoData, description: e.target.value })}
              className="mb-4"
            />
            <Input
              fullWidth
              label="URL do Arquivo para Download"
              value={conteudoData.file_download}
              onChange={(e) => setConteudoData({ ...conteudoData, file_download: e.target.value })}
              className="mb-4"
            />
            <Input
              fullWidth
              label="URL do Vídeo"
              value={conteudoData.video_url}
              onChange={(e) => setConteudoData({ ...conteudoData, video_url: e.target.value })}
              className="mb-4"
            />

            {/* Editor de Texto Rico */}
            <SimpleRichTextEditor
              value={conteudoData.rich_text}
              onChange={(html) => setConteudoData({ ...conteudoData, rich_text: html })}
              placeholder="Digite o conteúdo aqui..."
              title="Texto principal"
            />

            {/* SelectBox para Módulo */}
            <Select
              label="Selecione o Módulo"
              value={conteudoData.module_id}
              onChange={(e) => setConteudoData({ ...conteudoData, module_id: e.target.value })}
              className="mb-4"
              required
            >
              {modules.map((module: any) => (
                <SelectItem key={module.id} value={module.id}>
                  {module.title}
                </SelectItem>
              ))}
            </Select>

            <Select
              label="Tipo do Conteúdo"
              value={conteudoData.type}
              onChange={(e) => setConteudoData({ ...conteudoData, type: e.target.value })}
              className="mb-4"
              required
            >
              <SelectItem value="video" key={"1"}>
                Vídeo
              </SelectItem>
              <SelectItem value="arquivo" key={"2"}>
                Arquivo
              </SelectItem>
              <SelectItem value="texto" key={"3"}>
                Texto
              </SelectItem>
            </Select>

            <Button type="submit" color="primary" isLoading={isLoading} className="mt-4">
              {isLoading ? <Spinner size="sm" /> : "Adicionar Conteúdo"}
            </Button>
          </form>
        </CardBody>
      </Card>

      {/* Modal de sucesso */}
      <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Conteúdo Criado</ModalHeader>
          <ModalBody>
            <p>O conteúdo foi criado com sucesso!</p>
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onClick={() => {
                setIsSuccessModalOpen(false);
                router.push("/admin/conteudos");
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
