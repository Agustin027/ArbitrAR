import type React from "react";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ArbitrAR",
  description: "Simulador de arbitraje compuesto con cotizaciones de dólar en tiempo real",
  generator: "v0.dev",
  
  openGraph: {
    title: "ArbitrAR",
    description: "Simulador de arbitraje compuesto con cotizaciones de dólar y criptomonedas en tiempo real 🦫",
    url: "https://tu-proyecto.vercel.app", // Cambia esto por la URL de tu app desplegada
    type: "website",
    images: [
      {
        url: "/android-chrome-512x512.png", // Usa el logo que ya tienes en public/
        width: 512,
        height: 512,
        alt: "ArbitrAR Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ArbitrAR",
    description: "Simulador de arbitraje compuesto con cotizaciones de dólar y criptomonedas en tiempo real 🦫",
    images: ["/android-chrome-512x512.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        
        <meta charSet="UTF-8" />

      

     
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Color del tema para barras de navegación en móviles */}
        <meta name="theme-color" content="#1a1a1a" /> {/* Gris oscuro para el tema oscuro */}

        

      
        <meta name="author" content="Agustin" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}