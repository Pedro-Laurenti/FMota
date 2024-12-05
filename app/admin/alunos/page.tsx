"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Pagination,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Link,
  Input,
} from "@nextui-org/react";
import { IoSearch, IoTrash, IoEye } from "react-icons/io5";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  nome: string;
  email: string;
  tipo_usuario: string;
  data_criacao: string;
}

interface ApiResponse {
  count: number;
  results: User[];
}

const ROWS_PER_PAGE = 10;

export default function AdvancedTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userIdToDelete, setUserIdToDelete] = useState<number | null>(null);
  const [isResetLinkModalOpen, setIsResetLinkModalOpen] = useState(false);
  const [resetLink, setResetLink] = useState("");

  const router = useRouter();

  const fetchData = useCallback(async (currentPage: number, search = "") => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: currentPage.toString() });
      if (search) {
        params.append("search", search);  // Certifique-se de passar o parâmetro de busca
      }
      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch users.");
      }
      const data: ApiResponse = await response.json();
      setUsers(data.results);
      setTotalUsers(data.count);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(page, filterValue);
  }, [page, filterValue, fetchData]);

  const totalPages = useMemo(() => Math.ceil(totalUsers / ROWS_PER_PAGE), [totalUsers]);

  const handleViewDetails = (id: number) => {
    router.push(`/admin/alunos/${id}`);
  };

  const handleDelete = async (id: number) => {
    setUserIdToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const handleGenerateResetLink = async (userId: number) => {
    try {
      const response = await fetch(`/api/admin/users/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });
  
      if (!response.ok) {
        throw new Error("Falha ao gerar o link de redefinição de senha.");
      }
  
      const data = await response.json();
      setResetLink(data.link); // Salva o link gerado
      setIsResetLinkModalOpen(true); // Abre o modal
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const confirmDelete = async () => {
    if (userIdToDelete !== null) {
      try {
        const response = await fetch(`/api/admin/users?id=${userIdToDelete}`, { method: "DELETE" });
        if (!response.ok) {
          throw new Error("Falha ao excluir o usuário.");
        }
        fetchData(page, filterValue);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsDeleteModalOpen(false);
        setUserIdToDelete(null);
      }
    }
  };

  const renderCell = useCallback(
    (user: User, columnKey: keyof User | "actions") => {
      switch (columnKey) {
        case "nome":
          return user.nome;
        case "email":
          return user.email;
        case "tipo_usuario":
          return user.tipo_usuario;
        case "data_criacao":
          return new Date(user.data_criacao).toLocaleDateString("pt-BR");
        case "actions":
          return (
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly variant="light" size="sm">
                  <IoEye />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="view" onClick={() => handleViewDetails(user.id)}>
                  Detalhes
                </DropdownItem>
                <DropdownItem
                  key="generate-reset-link"
                  onClick={() => handleGenerateResetLink(user.id)}
                >
                  Gerar Link de Redefinição
                </DropdownItem>
                <DropdownItem key="delete" color="danger" onClick={() => handleDelete(user.id)}>
                  Excluir
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          );
        default:
          return null;
      }
    },
    [handleViewDetails, handleGenerateResetLink, handleDelete]
  );
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Buscar por nome..."
          className="border px-3 py-2 rounded"
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
        />
        <Link href="/admin/alunos/novo">
          <Button color="primary" size="lg">Novo Aluno</Button>
        </Link>
      </div>
      {error && <p className="text-red-500">Erro: {error}</p>}
      {isLoading ? (
        <Spinner />
      ) : (
        <Table aria-label="Tabela avançada de usuários">
          <TableHeader>
            <TableColumn key="nome">Nome</TableColumn>
            <TableColumn key="email">Email</TableColumn>
            <TableColumn key="tipo_usuario">Tipo</TableColumn>
            <TableColumn key="data_criacao">Data de Criação</TableColumn>
            <TableColumn key="actions">Ações</TableColumn>
          </TableHeader>
          <TableBody items={users}>
            {(user) => (
              <TableRow key={user.id}>
                {(columnKey) => (
                  <TableCell>{renderCell(user, columnKey as keyof User | "actions")}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}

      <div className="flex items-center justify-between">
        <Pagination
          total={totalPages}
          page={page}
          onChange={(p) => setPage(p)}
          showControls
          isDisabled={isLoading}
          />

        <span>Total de usuários: {totalUsers}</span>
      </div>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Confirmação de Exclusão</ModalHeader>
          <ModalBody>Tem certeza que deseja excluir este usuário?</ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button color="danger" onClick={confirmDelete}>
              Excluir
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isResetLinkModalOpen} onClose={() => setIsResetLinkModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Link de Redefinição</ModalHeader>
          <ModalBody>
            <p>Copie o link abaixo para redefinição de senha:</p>
            <Input
              readOnly
              value={resetLink}
              onClick={(e) => (e.target as HTMLInputElement).select()} // Seleciona o texto ao clicar
            />
          </ModalBody>
          <ModalFooter>
            <Button
              color="primary"
              onClick={() => {
                navigator.clipboard.writeText(resetLink); // Copia para a área de transferência
                setIsResetLinkModalOpen(false); // Fecha o modal
              }}
            >
              Copiar e Fechar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </div>
  );
}
