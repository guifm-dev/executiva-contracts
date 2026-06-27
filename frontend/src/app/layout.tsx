import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/auth.context";

import "./globals.css";

export const metadata: Metadata = {
  title: "Executiva Contracts",
  description: "Gestão de contratos para advogados",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
