import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gil Lopes Bueno - Senior Software Engineer",
  description: "Fullstack Dev since 2007, Blockchain Dev since 2018",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
      >
        {children}
      </body>
    </html>
  );
}
