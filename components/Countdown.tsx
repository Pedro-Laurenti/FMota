import { Link } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { IoLogoWhatsapp } from "react-icons/io5";

const releaseDate = new Date(Date.UTC(2024, 11, 29)); // Data de lançamento

interface CountdownProps {
  releaseTime: number;
  onComplete: () => void;
}

export default function Countdown ({ releaseTime, onComplete }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState(releaseTime - new Date().getTime());

  useEffect(() => {
    const interval = setInterval(() => {
      const remainingTime = releaseDate.getTime() - new Date().getTime();
      setTimeLeft(remainingTime);
      if (remainingTime <= 0) {
        clearInterval(interval);
        onComplete(); // Chama a função onComplete quando o tempo expirar
      }
    }, 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, []);

  if (timeLeft <= 0) return null;

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((timeLeft / (1000 * 60)) % 60);
  const seconds = Math.floor((timeLeft / 1000) % 60);

  return (
    <div className="flex flex-col justify-center items-center gap-10">
      <div className="flex justify-center items-center gap-5 md:gap-20">
        <div className="flex flex-col items-center text-center">
          <span className="font-mono text-3xl md:text-5xl">{days}</span>
          Dias
        </div>
        <div className="flex flex-col items-center">
          <span className="font-mono text-3xl md:text-5xl">{hours}</span>
          Horas
        </div>
        <div className="flex flex-col items-center">
          <span className="font-mono text-3xl md:text-5xl">{minutes}</span>
          Min
        </div>
        <div className="flex flex-col items-center">
          <span className="font-mono text-3xl md:text-5xl">{seconds}</span>
          Seg
        </div>
      </div>
      <h2 className="text-2xl text-center">Estamos preparando o melhor conteúdo para você!</h2>
      <Link className="text-2xl gap-5" href="https://chat.whatsapp.com/BB0n8vPDDLVG1uwNJxkekV" about="_blank">
        <IoLogoWhatsapp className="" /> Acesse nossa comunidade
      </Link>
    </div>
  );
};