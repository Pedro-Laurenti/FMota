"use client";
import { Logo } from "@/components/icons";
import { LayoutLogoff } from "./layoutsBib";
import { Button, Card, CardBody, CardFooter, CardHeader, Divider, Link, Accordion, AccordionItem, Avatar } from "@nextui-org/react";
import { siteConfig } from "@/config/site";
import { IoLogoYoutube, IoLogoWhatsapp, IoLogoInstagram } from "react-icons/io5";
import Particles from "react-tsparticles";
import { useCallback, useEffect, useState } from "react";
import { loadSlim } from "tsparticles-slim";
import { GoVerified } from "react-icons/go";
import { FaThreads } from "react-icons/fa6";

export default function Home() {
  const [isDark, setIsDark] = useState(false);

  // Hook para detectar o tema atual
  useEffect(() => {
    const theme = document.documentElement.classList.contains("dark");
    setIsDark(theme);
  }, []);

  const particlesInit = useCallback(async (engine: any) => {
    await loadSlim(engine);
  }, []);

  return (
    <LayoutLogoff>
      <div className="relative flex flex-col items-center justify-center min-h-screen">
        {/* Main Content */}
        <div className="relative w-full h-screen overflow-hidden flex justify-center items-center z-20 border-b-1 border-default-400">
          <Card isBlurred className="m-5 absolute z-30 md:w-1/3 md:right-48 bottom-10 md:bottom-1/3 border-1 border-default-400">
            <CardHeader className="border-b-1 border-default-400 flex items-center justify-center">
              <Logo size={45} className="mr-2" />
              <h2 className="text-2xl font-bold text-primary-500">Mentoria Integração Transdisciplinar</h2>
            </CardHeader>
            <CardBody>
              <p className="text-lg leading-relaxed text-center">
                Nossa mentoria oferece toda a preparação necessária para criar e implementar uma 
                equipe transdisciplinar de alta performance.
              </p>
            </CardBody>
            <CardFooter className="flex gap-5 border-t-1 border-default-400">
              <Link href="/checkout" className="w-full">
                <Button size="lg" color="primary" className="w-full font-black uppercase">Inscreva-se</Button>
              </Link>
              <Link isExternal aria-label="YouTube" href={siteConfig.links.youtube}>
                <IoLogoYoutube className="" size={24} />
              </Link>
              <Link isExternal aria-label="WhatsApp" href={siteConfig.links.whatsapp}>
                <IoLogoWhatsapp className="" size={24} />
              </Link>
              <Link isExternal aria-label="Instagram" href={siteConfig.links.instagram}>
                <IoLogoInstagram className="" size={24} />
              </Link>
            </CardFooter>
          </Card>

          <img src="/relative/mota.png" className="hidden brightness-125 md:block absolute z-30 md:w-1/2 lg:w-1/3 bottom-0 md:left-48" alt="" />
          <Logo className="absolute z-20 w-full md:w-1/3 md:left-48 opacity-30 h-[100%]" />
          <div className="absolute inset-0 bg-black bg-fixed bg-cover bg-center opacity-20 brightness-50" style={{ backgroundImage: "url('relative/background.jpg')" }} />
          <div className="absolute inset-0 overflow-hidden">
            <Particles
              className="w-full h-full opacity-35"
              init={particlesInit}
              options={{
                fullScreen: false,
                background: { color: { value: "" } },
                fpsLimit: 100,
                particles: {
                  color: { value: isDark ? "#ffffff" : "#000000" }, // Cor dinâmica
                  links: { enable: true, color: isDark ? "#ffffff" : "#000000", distance: 150, opacity: 0.4 },
                  move: { enable: true, speed: 1 },
                  number: { density: { enable: true, area: 1000 }, value: 50 },
                  opacity: { value: 0.5 },
                  size: { value: { min: 1, max: 5 } },
                },
                detectRetina: true,
              }}
            />
          </div>
        </div>

        {/* Sessão Explicando a Mentoria */}
        <div className="w-full min-h-[80vh] py-16 px-10 bg-primary-50 flex flex-col items-center justify-center gap-5">
          <h2 className="text-3xl font-bold text-primary-500">Sobre a Mentoria</h2>
          <p className="text-lg md:text-justify md:w-96">
            Nossa mentoria oferece toda a preparação necessária para a criação e implementação de uma equipe transdisciplinar de alta performance. Você terá acesso a ferramentas de gestão, práticas terapêuticas avançadas e muito mais para unir e fortalecer sua equipe.
          </p>
          <p className="text-lg md:text-justify md:w-96">
            Ao aderir à mentoria, você terá acesso à:
          </p>
          <ul className="list-disc md:text-justify md:w-96">
            <li>Plataforma para networking e colaboração </li>
            <li>Conteúdo premium exclusivo </li>
            <li>Encontros semanais agendados </li>
            <li>Acesso vitalício à plataforma e ao grupo </li>
          </ul>
          <Link href="/checkout" className="w-full max-w-96 mt-10">
            <Button size="lg" color="primary" className="w-full font-black uppercase">Adquira agora</Button>
          </Link>

        </div>

        {/* Sessão de Depoimentos */}
        <div className="w-full min-h-[80vh] py-16 px-10 bg-content1-foreground flex flex-col items-center justify-center">
          <h2 className="text-3xl font-bold text-center mb-10 text-primary-500">O que nossos alunos dizem</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="shadow-lg">
              <CardBody>
                <p>A mentoria foi essencial para transformar nossa equipe. Recomendo fortemente!</p>
                <footer className="mt-4 flex items-center gap-5 font-bold">
                  <Avatar isBordered color="warning" src="https://i.pravatar.cc/150?u=a04258114e29026702d" />
                  - João Silva
                </footer>
              </CardBody>
            </Card>
            <Card className="shadow-lg">
              <CardBody>
                <p>Conseguimos alinhar nossa equipe e melhorar os resultados em poucos meses.</p>
                <footer className="mt-4 flex items-center gap-5 font-bold">
                  <Avatar isBordered color="danger" src="https://i.pravatar.cc/150?u=a042581f4e29026704d" />
                  - Maria Oliveira
                </footer>
              </CardBody>
            </Card>
            <Card className="shadow-lg">
              <CardBody>
                <p>Melhor decisão que tomamos foi participar desta mentoria. Vale cada centavo!</p>
                <footer className="mt-4 flex items-center gap-5 font-bold">
                  <Avatar isBordered color="primary" src="https://i.pravatar.cc/150?u=a04258a2462d826712d" />
                  - Carlos Mendes
                </footer>
              </CardBody>
            </Card>
            <Card className="shadow-lg">
              <CardBody>
                <p>A experiência foi incrível! Aprendemos muito e estamos colhendo os resultados.</p>
                <footer className="mt-4 flex items-center gap-5 font-bold">
                  <Avatar isBordered color="success" src="https://i.pravatar.cc/150?u=a04258114e29026708d" />
                  - Fernanda Costa
                </footer>
              </CardBody>
            </Card>
            <Card className="shadow-lg">
              <CardBody>
                <p>Recomendo para todos que querem evoluir e alcançar seus objetivos.</p>
                <footer className="mt-4 flex items-center gap-5 font-bold">
                  <Avatar isBordered color="secondary" src="https://i.pravatar.cc/150?u=a04225814f4e2902670sd" />
                  - Lucas Pereira
                </footer>
              </CardBody>
            </Card>
            <Card className="shadow-lg">
              <CardBody>
                <p>Essa mentoria fez toda a diferença na minha carreira profissional.</p>
                <footer className="mt-4 flex items-center gap-5 font-bold">
                  <Avatar isBordered color="warning" src="https://i.pravatar.cc/150?u=a042581f4e29026709d" />
                  - Ana Santos
                </footer>
              </CardBody>
            </Card>
          </div>
        </div>


        <div className="w-full min-h-[80vh] py-16 px-10 flex flex-col items-center justify-center">
          <div className="flex flex-row items-center gap-20">
            <Avatar isBordered color="primary" className="w-48 h-48" src="/relative/avatar.jpg" />
            <div className="flex flex-col">
              <div className="mb-1 flex gap-3 items-center ">
                <h2 className="text-3xl font-bold">felipemoraesmota_</h2>
                <GoVerified className="text-3xl font-extrabold text-primary-500" />
              </div>
              <h3 className="text-2xl font-bold text-primary-500">Felipe Moraes Mota</h3>
              <Button color="default" className="mt-3 w-fit flex gap-2 items-center" radius="full">
                <FaThreads className="text-2xl" /> Threads
              </Button>
              <ul className="my-5">
                <li>🔱 Psicólogo CRP 09/15709</li>
                <li>❤️ @maria_eduarda_pereeira</li>
                <li>✍️ Escritor e palestrante🏆</li>
                <li>🚀 Mestrando em Análise de Comportamento - PUC GO</li>
                <li>⬇️ Visite o meu perfil</li>
                <li>
                  <Link isExternal href="https://www.instagram.com/felipemoraesmota_/" about="blank" className="text-primary-500 mt-2">
                    instagram.com/felipemoraesmota_
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Accordion com Perguntas Frequentes */}
        <div className="w-full min-h-[80vh] flex flex-col items-center justify-center py-16 px-10 bg-primary-50">
          <h2 className="text-3xl font-bold text-center mb-6 text-primary-500">Perguntas Frequentes</h2>
          <Accordion>
            <AccordionItem key="1" title="O que é nossa mentoria?">
              Nossa mentoria oferece toda a preparação necessária para a criação e implementação de uma equipe transdisciplinar de alta performance.
            </AccordionItem>
            <AccordionItem key="2" title="O que você terá acesso?">
              Durante o programa, você terá acesso a sistemas de gestão eficientes, modelos terapêuticos atualizados, documentação estratégica para integração das áreas e guias práticos para a redução de comportamentos problemáticos.
            </AccordionItem>
            <AccordionItem key="3" title="Quais práticas serão apresentadas?">
              Apresentaremos modelos de supervisão eficazes, práticas para promover uma equipe saudável e engajada, e metodologias comprovadas para fortalecer e unir seu time.
            </AccordionItem>
            <AccordionItem key="4" title="Qual o objetivo da mentoria?">
              Com nossa mentoria, sua equipe estará preparada para alcançar resultados excepcionais!
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </LayoutLogoff>
  );
}
