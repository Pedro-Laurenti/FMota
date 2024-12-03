'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardBody, CardFooter, Divider } from '@nextui-org/react';

interface Content {
  title: string;
  description: string;
  rich_text?: string;
  video_url?: string;
  file_download?: string;
}

const fetchContentDetails = async (moduleId: string, contentId: string): Promise<Content> => {
  const response = await fetch(`/api/dashboard/modules/${moduleId}/${contentId}`);
  if (!response.ok) throw new Error("Erro ao carregar o conteúdo");
  return await response.json();
};

export default function ContentPage() {
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Garantir que a renderização está acontecendo no client
  }, []);

  const params = useParams();
  const { moduleId, contentId } = params;

  useEffect(() => {
    if (isClient && moduleId && contentId) {
      const loadContentDetails = async () => {
        try {
          const data = await fetchContentDetails(String(moduleId), String(contentId));
          setContent(data);
        } catch (error) {
          console.error("Erro ao carregar o conteúdo:", error);
        } finally {
          setLoading(false);
        }
      };
      loadContentDetails();
    }
  }, [isClient, moduleId, contentId]);

  if (loading) {
    return <p>Carregando conteúdo...</p>;
  }

  if (!content) {
    return <p>Conteúdo não encontrado</p>;
  }

  return (
    <div className="content-page">
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">{content.title}</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          <p>{content.description}</p>
          {content.rich_text && (
            <div dangerouslySetInnerHTML={{ __html: content.rich_text }} />
          )}
          {content.video_url && content.video_url.trim() !== '' && (
            <div className="video-container">
              <video controls width="100%">
                <source src={content.video_url} type="video/mp4" />
                Seu navegador não suporta o formato de vídeo.
                <track kind="captions" />
              </video>
            </div>
          )}
          {content.file_download && content.file_download.trim() !== '' && (
            <div className="file-download">
              <a href={content.file_download} download>
                Baixar arquivo
              </a>
            </div>
          )}
        </CardBody>
        <CardFooter>
          <button onClick={() => alert('Ação de interação com o conteúdo')}>
            Interagir com o conteúdo
          </button>
        </CardFooter>
      </Card>
    </div>
  );
}
