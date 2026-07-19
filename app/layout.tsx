import './globals.css';
import { AuthProvider } from '@/lib/auth';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sonali Kothari Academy | Secure Aligned Learning Portal',
  description: 'Premium course curriculum and client breakthrough dashboard, custom-designed to shift your daily habit identity.',
  keywords: ['Aligned habits', 'Personal shift', 'Identity design', 'Sonali Kothari'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Load Outfit for display headers, Inter for standard text */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased min-h-screen bg-background text-textPrimary">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
