import { Poppins as FontMono, Lato as FontSans } from "next/font/google";

export const fontSans = FontSans({
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-sans",
});

export const fontMono = FontMono({
  weight: ["100", "300", "400", "700", "900"],
  subsets: ["latin"],
  variable: "--font-mono",
});
