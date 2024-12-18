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
} from "@nextui-org/react";
import { IoEye } from "react-icons/io5";
import { useRouter } from "next/navigation";

interface Content {
  id: number;
  title: string;
}

interface ApiResponse {
  count: number;
  results: Content[];
}

const ROWS_PER_PAGE = 10;

export default function ContentTable() {
  const [contents, setContents] = useState<Content[]>([]);
  const [totalContents, setTotalContents] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [contentIdToDelete, setContentIdToDelete] = useState<number | null>(null);

  const router = useRouter();

  const fetchData = useCallback(async (currentPage: number, search = "") => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: currentPage.toString() });
      if (search) {
        params.append("search", search);
      }
      const response = await fetch(`/api/admin/conteudos?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch contents.");
      }
      const data: ApiResponse = await response.json();
      setContents(data.results);
      setTotalContents(data.count);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(page, filterValue);
  }, [page, filterValue, fetchData]);

  const totalPages = useMemo(() => Math.ceil(totalContents / ROWS_PER_PAGE), [totalContents]);

  const handleDelete = async (id: number) => {
    setContentIdToDelete(id);
    setIsDeleteModalOpen(true);
  };
  

  const confirmDelete = async () => {
    if (contentIdToDelete !== null) {
      try {
        const response = await fetch(`/api/admin/conteudos?id=${contentIdToDelete}`, {
          method: "DELETE",
        });
  
        if (!response.ok) {
          throw new Error("Erro ao excluir conteúdo.");
        }
  
        fetchData(page, filterValue);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsDeleteModalOpen(false);
        setContentIdToDelete(null);
      }
    }
  };


  const handleViewDetails = (id: number) => {
    router.push(`/admin/conteudos/${id}`);
  };

  const renderCell = useCallback(
    (content: Content, columnKey: keyof Content | "actions") => {
      switch (columnKey) {
        case "title":
          return content.title;
        case "actions":
          return (
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly variant="light" size="sm">
                  <IoEye />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="view" onPress={() => handleViewDetails(content.id)}>
                  Detalhes
                </DropdownItem>
                <DropdownItem key="delete" color="danger" onPress={() => handleDelete(content.id)}>
                  Excluir
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          );
        default:
          return null;
      }
    },
    [handleViewDetails]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <input
          type="text"
          placeholder="Buscar por título..."
          className="border px-3 py-2 rounded"
          value={filterValue}
          onChange={(e) => setFilterValue(e.target.value)}
        />
        <Link href="/admin/conteudos/novo">
          <Button color="primary" size="lg">Novo conteúdo</Button>
        </Link>
      </div>
      {error && <p className="text-red-500">Erro: {error}</p>}
      {isLoading ? (
        <Spinner />
      ) : (
        <Table aria-label="Tabela de conteúdos">
          <TableHeader>
            <TableColumn key="title">Título</TableColumn>
            <TableColumn key="actions">Ações</TableColumn>
          </TableHeader>
          <TableBody items={contents}>
            {(content) => (
              <TableRow key={content.id}>
                {(columnKey) => (
                  <TableCell>{renderCell(content, columnKey as keyof Content | "actions")}</TableCell>
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
        <span>Total de conteúdos: {totalContents}</span>
      </div>

        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Confirmação de Exclusão</ModalHeader>
          <ModalBody>Tem certeza que deseja excluir este módulo?</ModalBody>
          <ModalFooter>
            <Button onPress={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
            <Button color="danger" onPress={confirmDelete}>
              Excluir
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

