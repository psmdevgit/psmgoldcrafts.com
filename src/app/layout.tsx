import type { Metadata } from "next";

import "./globals.css";
import "../../styles/index.scss";



export const metadata: Metadata = {
  title: "PSM Gold Crafts",
  description: "Generated PSM PVT LTD",
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