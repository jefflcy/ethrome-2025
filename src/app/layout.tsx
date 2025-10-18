import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CivicAuthProvider } from "@civic/auth-web3/nextjs";
import "./globals.css";
import { ClientProviders } from "@/components/client-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartNexus",
  description: "AI assistant integrated with Civic Nexus",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientProviders>
          <CivicAuthProvider>
            {children}
          </CivicAuthProvider>
        </ClientProviders>
      </body>
    </html>
  );
}
