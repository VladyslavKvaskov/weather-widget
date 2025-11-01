import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Weather Widget",
  description: "Weather widget",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
