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
import { IoEye, IoTrash } from "react-icons/io5";
import { useRouter } from "next/navigation";

interface Module {
  id: number;
  title: string;
}

interface ApiResponse {
  count: number;
  results: Module[];
}

const ROWS_PER_PAGE = 10;

export default function ModuleTable() {
  const [modules, setModules] = useState<Module[]>([]);
  const [totalModules, setTotalModules] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterValue, setFilterValue] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [moduleIdToDelete, setModuleIdToDelete] = useState<number | null>(null);

  const router = useRouter();

  const fetchData = useCallback(async (currentPage: number, search = "") => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: currentPage.toString() });
      if (search) {
        params.append("search", search);  // Certifique-se de passar o parâmetro de busca
      }
      const response = await fetch(`/api/admin/modulos?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch modules.");
      }
      const data: ApiResponse = await response.json();
      setModules(data.results);
      setTotalModules(data.count);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(page, filterValue);
  }, [page, filterValue, fetchData]);

  const totalPages = useMemo(() => Math.ceil(totalModules / ROWS_PER_PAGE), [totalModules]);

  const handleDelete = async (id: number) => {
    setModuleIdToDelete(id);
    setIsDeleteModalOpen(true);
  };
  

  const confirmDelete = async () => {
    if (moduleIdToDelete !== null) {
      try {
        const response = await fetch(`/api/admin/modulos?id=${moduleIdToDelete}`, {
          method: "DELETE",
        });
  
        if (!response.ok) {
          throw new Error("Erro ao excluir módulo.");
        }
  
        fetchData(page, filterValue);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setIsDeleteModalOpen(false);
        setModuleIdToDelete(null);
      }
    }
  };


  const handleViewDetails = (id: number) => {
    router.push(`/admin/modulos/${id}`);
  };

  const renderCell = useCallback(
    (module: Module, columnKey: keyof Module | "actions") => {
      switch (columnKey) {
        case "title":
          return module.title;
        case "actions":
          return (
            <Dropdown>
              <DropdownTrigger>
                <Button isIconOnly variant="light" size="sm">
                  <IoEye />
                </Button>
              </DropdownTrigger>
              <DropdownMenu>
                <DropdownItem key="view" onClick={() => handleViewDetails(module.id)}>
                  Detalhes
                </DropdownItem>
                <DropdownItem key="delete" color="danger" onClick={() => handleDelete(module.id)}>
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
        <Link href="/admin/modulos/novo">
          <Button color="primary" size="lg">Novo Módulo</Button>
        </Link>
      </div>
      {error && <p className="text-red-500">Erro: {error}</p>}
      {isLoading ? (
        <Spinner />
      ) : (
        <Table aria-label="Tabela de módulos">
          <TableHeader>
            <TableColumn key="title">Título</TableColumn>
            <TableColumn key="actions">Ações</TableColumn>
          </TableHeader>
          <TableBody items={modules}>
            {(module) => (
              <TableRow key={module.id}>
                {(columnKey) => (
                  <TableCell>{renderCell(module, columnKey as keyof Module | "actions")}</TableCell>
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
        <span>Total de módulos: {totalModules}</span>
      </div>

        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
        <ModalContent>
          <ModalHeader>Confirmação de Exclusão</ModalHeader>
          <ModalBody>Tem certeza que deseja excluir este módulo?</ModalBody>
          <ModalFooter>
            <Button onClick={() => setIsDeleteModalOpen(false)}>Cancelar</Button>
            <Button color="danger" onClick={confirmDelete}>
              Excluir
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

