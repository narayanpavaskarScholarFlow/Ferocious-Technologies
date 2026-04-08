import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bharat Axis Pvt Ltd | Advanced Tool Management',
  description: 'Precision resource management with intelligent AI categorization.',
};

export default function RootLayer({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@500;700&family=Source+Code+Pro&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-white text-foreground min-h-screen" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
