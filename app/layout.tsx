import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import TableResponsiveHelper from "@/components/TableResponsiveHelper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ChurchBench | PCEA Nkoroi",
  description: "Multi-Tenant Performance Tracking System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <TableResponsiveHelper />
          {children}
        </Providers>
      </body>
    </html>
  );
}
