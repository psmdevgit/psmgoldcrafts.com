import type { Metadata } from "next";

import "./globals.css";
import "../../styles/index.scss";



export const metadata: Metadata = {
  title: "KALASH JEWELLERS GOLD CRAFTS",
  description: "KALASH JEWELLERS GOLD CRAFTS PVT LTD",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}