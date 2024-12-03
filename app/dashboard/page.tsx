'use client';

import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import Link from "next/link";
import { Card, CardHeader, CardFooter, Divider } from "@nextui-org/react";
import { IoCalendar, IoCamera, IoDocument } from "react-icons/io5";
import Countdown from "@/components/Countdown";

interface Module {
  id: number;
  title: string;
  contents: {
    id: number;
    title: string;
    description: string;
    type: "archive" | "schedule" | "record"; // Tipo do conteúdo
  }[];
}

const fetchModules = async () => {
  const response = await fetch("/api/dashboard/modules");
  if (!response.ok) throw new Error("Erro ao carregar os módulos");
  return await response.json();
};

export default function Dashboard() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCountdownComplete, setIsCountdownComplete] = useState(false); // Estado para verificar se o countdown terminou

  const releaseDate = new Date(Date.UTC(2024, 9, 18)); // Data de lançamento

  useEffect(() => {
    const loadModules = async () => {
      try {
        const data = await fetchModules();
        setModules(data);
      } catch (error) {
        console.error("Erro ao carregar os módulos:", error);
      } finally {
        setLoading(false);
      }
    };

    loadModules();
  }, []);

  const handleCountdownComplete = () => {
    setIsCountdownComplete(true); // Altera o estado quando o countdown terminar
  };

  if (loading) {
    return <p>Carregando módulos...</p>;
  }

  if (!isCountdownComplete) {
    return(
      <div className="flex items-center justify-center h-full">
        <Countdown releaseTime={releaseDate.getTime()} onComplete={handleCountdownComplete} />
      </div>
    )
  }

  const settings = {
    dots: true,
    infinite: false,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  const getIcon = (type: "archive" | "schedule" | "record") => {
    switch (type) {
      case "archive":
        return <IoDocument className="w-6 h-6 text-gray-600" />;
      case "schedule":
        return <IoCalendar className="w-6 h-6 text-gray-600" />;
      case "record":
        return <IoCamera className="w-6 h-6 text-gray-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="dashboard">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      {modules.map((module) => (
        <div key={module.id} className="module mb-8">
          <h2 className="text-xl font-semibold mb-4">{module.title}</h2>
          <Slider {...settings}>
            {module.contents.map((content) => {
              // Construção do link para o novo padrão de rota
              const contentLink = `/dashboard/${module.id}/${content.id}`;
              return (
                <Card key={content.id} className="max-w-[400px]">
                  <Link href={contentLink} passHref>
                    <CardHeader className="flex gap-3">
                      {getIcon(content.type)} {/* Adicionando o ícone dependendo do tipo */}
                      <span>{content.title}</span>
                    </CardHeader>
                    <Divider />
                    <CardFooter>
                      <p>{content.description}</p>
                    </CardFooter>
                  </Link>
                </Card>
              );
            })}
          </Slider>
        </div>
      ))}
    </div>
  );
}
