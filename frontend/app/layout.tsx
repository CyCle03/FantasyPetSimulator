import "./globals.css";

export const metadata = {
  title: "SD Fantasy Pet MVP",
  description: "Collect and breed fantasy pets"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bree+Serif&family=DM+Sans:wght@400;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen">
        {children}
      </body>
    </html>
  );
}
