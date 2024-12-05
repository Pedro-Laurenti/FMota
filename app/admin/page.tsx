"use client";

import { useEffect, useState, useMemo } from "react";
import { Chart } from "react-chartjs-2";
import "chart.js/auto"; // Import necessário para Chart.js
import { Table, TableBody, TableCell, TableColumn, TableHeader, TableRow } from "@nextui-org/react";

export default function Admin() {
  const [earningsData, setEarningsData] = useState({ labels: [], data: [] });
  const [subscriptionsData, setSubscriptionsData] = useState({ labels: [], data: [] });
  const [recentUsers, setRecentUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [earningsRes, subscriptionsRes, usersRes] = await Promise.all([
          fetch("/api/admin/earnings"),
          fetch("/api/admin/subscriptions"),
          fetch("/api/admin/recent-users"),
        ]);

        const earningsJson = await earningsRes.json();
        const subscriptionsJson = await subscriptionsRes.json();
        const usersJson = await usersRes.json();

        setEarningsData(earningsJson);
        setSubscriptionsData(subscriptionsJson);
        setRecentUsers(usersJson);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    };

    fetchData();
  }, []);

  // Memoização para evitar recriação de objetos
  const earningsChartConfig = useMemo(() => ({
    labels: earningsData.labels,
    datasets: [
      {
        label: "Ganhos (R$)",
        data: earningsData.data,
        borderColor: "#4caf50",
        backgroundColor: "rgba(76, 175, 80, 0.2)",
      },
    ],
  }), [earningsData]);

  const subscriptionsChartConfig = useMemo(() => ({
    labels: subscriptionsData.labels,
    datasets: [
      {
        label: "Inscrições",
        data: subscriptionsData.data,
        backgroundColor: "#2196f3",
      },
    ],
  }), [subscriptionsData]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: "top" as const },
    },
    layout: {
      padding: { top: 20, bottom: 20 },
    },
  }), []);
  
  return (
    <div className="space-y-14">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="flex md:gap-10 md:flex-row flex-col items-center justify-center">

        {/* Gráfico de ganhos */}
        <div className="max-h-96 w-full">
          <h2 className="text-2xl font-semibold">Ganhos por Período</h2>
          <Chart type="line" data={earningsChartConfig} options={chartOptions} />
        </div>

        {/* Gráfico de inscrições */}
        <div className="max-h-96 w-full">
          <h2 className="text-2xl font-semibold">Inscrições por Período</h2>
          <Chart type="bar" data={subscriptionsChartConfig} options={chartOptions} />
        </div>
      </div>

      {/* Tabela de últimos usuários cadastrados */}
      <div className="">
        <h2 className="text-2xl font-semibold mb-4">Últimos Usuários Cadastrados</h2>
        <Table>
          <TableHeader>
            <TableColumn>Nome</TableColumn>
            <TableColumn>Email</TableColumn>
            <TableColumn>Permissões</TableColumn>
            <TableColumn>Data de Criação</TableColumn>
          </TableHeader>
          <TableBody>
            {recentUsers.map((user: any) => (
              <TableRow key={user.id}>
                <TableCell>{user.nome}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.tipo_usuario}</TableCell>
                <TableCell>{new Date(user.data_criacao).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
