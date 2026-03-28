import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Metadata Profissional para o Projeto
export const metadata: Metadata = {
  title: "Simulador de Negócios Cencosud | DeDev",
  description: "Plataforma avançada de simulação estratégica de varejo. Gerencie sua loja, otimize o EBITDA e domine o mercado.",
  keywords: ["Cencosud", "Simulador", "Varejo", "Business Game", "EBITDA", "DeDev"],
  authors: [{ name: "André Lucas (DeDev)" }],
  icons: {
    icon: "/imagens/logo.png", // Usa a sua logo como ícone da aba
  },
};

export const viewport: Viewport = {
  themeColor: "#005C9E", // Cor da barra do navegador no celular (Azul Cencosud)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased scroll-smooth`}
    >
      <head>
        {/* Fallback para a logo no título da aba se o favicon demorar */}
        <link rel="icon" href="/imagens/logo.png" />
      </head>
      <body className="min-h-full flex flex-col bg-white">
        {/* Aqui você pode colocar um Header global se quiser que apareça em todas as 8 páginas */}
        <main className="flex-grow">
          {children}
        </main>
        
        {/* Exemplo de rodapé simples e fixo de copyright */}
        <footer className="py-4 text-center text-xs text-gray-400 border-t border-gray-50">
          Powered by <span className="font-bold text-cencosud-blue text-[10px] uppercase tracking-widest">DeDev Simulator v1.0</span>
        </footer>
      </body>
    </html>
  );
}