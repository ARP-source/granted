import type { Metadata } from 'next';


export const metadata: Metadata = {
  title: 'GrantForge — Policy Sentinel',
  description: 'AI-powered grant monitoring and policy alert system for international students',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
