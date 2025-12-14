import type { Metadata } from 'next';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import { TranslationProvider } from '@/contexts/TranslationContext';

export const metadata: Metadata = {
  title: 'AgenticX5 | Supplier Engagement Control Tower',
  description: 'IMDS & PCF Management Platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className="bg-[#0a0a0f] text-white antialiased">
        <TranslationProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="flex-1 ml-64">
              <Header />
              <main className="pt-16 p-6 min-h-screen">
                {children}
              </main>
            </div>
          </div>
        </TranslationProvider>
      </body>
    </html>
  );
}
