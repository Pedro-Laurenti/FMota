'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardBody, CardFooter, Divider, Spinner } from '@nextui-org/react';

interface Content {
  title: string;
  description: string;
  rich_text?: string;
  video_url?: string;
  file_download?: string;
}

const fetchContentDetails = async (moduleId: string, contentId: string): Promise<Content> => {
  const response = await fetch(`/api/dashboard/modules/content?moduleId=${moduleId}&contentId=${contentId}`);
  if (!response.ok) throw new Error("Erro ao carregar o conteúdo");
  return await response.json();
};

export default function ContentPage() {
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const { moduleId, contentId } = params;

  useEffect(() => {
    if (moduleId && contentId) {
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
  }, [moduleId, contentId]);

  if (loading) {
    return <Spinner />;
  }

  if (!content) {
    return <p>Conteúdo não encontrado</p>;
  }

  return (
    <div className="content-page">
      <Card>
        <CardHeader className='flex flex-col items-start'>
          <h2 className="text-xl font-semibold">{content.title}</h2>
          <p className='text-xs text-default-500'>{content.description}</p>
        </CardHeader>
        <Divider />
        <CardBody>

          {content.rich_text && (
            <div className='prose prose-sm sm:prose lg:prose-lg prose-neutral prose-headings:text-primary prose-a:text-primary prose-strong:text-secondary-foreground focus:outline-none text-primary' style={{ color: 'var(--nextui-color-text)' }} dangerouslySetInnerHTML={{ __html: content.rich_text }} />
          )}
          {content.video_url && content.video_url.trim() !== '' && (
            <div className="video-container">
              {content.video_url.includes("youtube.com") ? (
                <iframe
                  width="100%"
                  height="315"
                  src={`${content.video_url.includes('?') ? content.video_url + '&rel=0' : content.video_url + '?rel=0'}`}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video controls width="100%">
                  <source src={content.video_url} type="video/mp4" />
                  Seu navegador não suporta o formato de vídeo.
                  <track kind="captions" />
                </video>
              )}
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
      </Card>
    </div>
  );
}
