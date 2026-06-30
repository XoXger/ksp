import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ActiveLoginHeartbeat } from "@/components/ActiveLoginHeartbeat";
import { AdminTabIdentityLinks } from "@/components/AdminTabIdentityLinks";
import { MemberTabIdentityLinks } from "@/components/MemberTabIdentityLinks";
import { getSessionIdentity } from "@/lib/session";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Koperasi Simpan Pinjam Tarunajaya",
  description: "Aplikasi koperasi simpan pinjam Tarunajaya",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSessionIdentity();

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ActiveLoginHeartbeat session={session} />
        <AdminTabIdentityLinks />
        <MemberTabIdentityLinks />
        {children}
      </body>
    </html>
  );
}
