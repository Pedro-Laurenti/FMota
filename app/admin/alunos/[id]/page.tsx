"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Input, Button, Spinner, Card, CardBody, CardHeader, Link, Select, SelectItem, DateInput } from "@nextui-org/react";
import { CalendarDate } from "@internationalized/date";
import { IoPencilOutline } from "react-icons/io5"; // Ícone de caneta
import { useRouter } from "next/navigation";

export default function UsuarioDetalhes() {
  const { id } = useParams();
  const [userData, setUserData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedTipoUsuario, setSelectedTipoUsuario] = useState("pendente");
  const [isEditable, setIsEditable] = useState<boolean>(false); // Novo estado para edição
  const router = useRouter();

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      fetch(`/api/admin/users/id?userId=${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data) {
            setUserData(data);
            setSelectedTipoUsuario(data.tipo_usuario || "pendente");
          }
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Erro ao carregar dados do usuário:", error);
          setIsLoading(false);
        });
    }
  }, [id]);

  const handleSave = async (event: React.FormEvent) => {
    event.preventDefault();
  
    const updatedUser = {
      nome: userData.nome,
      email: userData.email,
      tipo_usuario: selectedTipoUsuario,
      numero_contato: userData.numero_contato,
      data_criacao: userData.data_criacao, // Certifique-se de que a data está no formato correto
    };
  
    try {
      const response = await fetch(`/api/admin/users/id?userId=${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedUser),
      });
  
      if (response.ok) {
        const data = await response.json();
        router.push("/admin/alunos");
      } else {
        const errorData = await response.json();
        console.error("Erro ao salvar:", errorData);
      }
    } catch (error) {
      console.error("Erro ao salvar as alterações:", error);
    }
  };
  

  const convertToCalendarDate = (dateString: string) => {
    const date = new Date(dateString);
    return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="p-6 w-full max-w-96 relative">
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Detalhes do Usuário</h2>
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
          {userData ? (
            <form onSubmit={handleSave}>
              <Input
                fullWidth
                unselectable="on"
                readOnly
                label="ID"
                value={userData.id}
                onChange={(e) => setUserData({ ...userData, id: e.target.value })}
                className="mb-4"
              />
              <Input
                fullWidth
                isDisabled={!isEditable}
                label="Nome"
                value={userData.nome}
                onChange={(e) => setUserData({ ...userData, nome: e.target.value })}
                className="mb-4"
              />
              <Input
                fullWidth
                isDisabled={!isEditable}
                label="Email"
                value={userData.email}
                onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                className="mb-4"
              />
              
              {/* Select para o tipo de usuário */}
              <Select
                fullWidth
                isDisabled={!isEditable}
                label="Tipo de Usuário"
                value={selectedTipoUsuario}
                onChange={(e) => setSelectedTipoUsuario(e.target.value)}
                defaultSelectedKeys={[selectedTipoUsuario]}
                className="mb-4"
              >
                <SelectItem value="administrador" key="administrador">Administrador</SelectItem>
                <SelectItem value="assinante" key="assinante">Assinante</SelectItem>
                <SelectItem value="pendente" key="pendente">Pendente</SelectItem>
              </Select>

              <Input
                fullWidth
                isDisabled={!isEditable}
                label="Telefone"
                value={userData.numero_contato}
                onChange={(e) => setUserData({ ...userData, numero_contato: e.target.value })}
                className="mb-4"
              />
              
              <DateInput
                fullWidth
                label="Data de Inscrição"
                isDisabled={!isEditable}
                value={userData.data_criacao ? convertToCalendarDate(userData.data_criacao) : null}
                onChange={(newDate) => {
                  if (newDate) {
                    const date = new Date(newDate.year, newDate.month - 1, newDate.day);
                    setUserData({ ...userData, data_criacao: date.toISOString() });
                  }
                }}
                className="mb-4 max-w-sm"
              />

              {isEditable ? (
                <Button type="submit" color="primary" className="mt-4 w-full">
                  Salvar Alterações
                </Button>
              ) : (
                <Link href="/admin/alunos" className="w-full">
                  <Button type="button" color="primary" className="mt-4 w-full">
                    Voltar
                  </Button>
                </Link>
              )}
            </form>
          ) : (
            <>
              <p className="font-semibold text-danger">Usuário não encontrado.</p>
              <Link href="/admin/alunos">
                <Button type="button" color="primary" className="mt-4">
                  Voltar
                </Button>
              </Link>
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
