import type { Metadata } from 'next';
import Script from 'next/script';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getSettings } from '@/lib/settings';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

/** Title, description and verification come from the admin Settings page. */
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();

  return {
    title: {
      default: settings.siteTitle,
      template: `%s | ${settings.siteTitle}`,
    },
    description: settings.defaultMetaDescription || settings.siteDescription,
    keywords: ['Gurugram', 'Gurgaon', 'local guide', 'restaurants', 'places', 'events'],
    metadataBase: new URL('https://gurugramdekho.com'),
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: 'https://gurugramdekho.com',
      siteName: settings.siteTitle,
      description: settings.siteDescription,
    },
    robots: { index: true, follow: true },
    ...(settings.searchConsoleVerification && {
      verification: { google: settings.searchConsoleVerification },
    }),
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const gaId = settings.googleAnalyticsId;

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <div className="flex flex-col min-h-screen">
          <Header siteTitle={settings.siteTitle} tagline={settings.siteTagline} />
          <main className="flex-grow">{children}</main>
          <Footer siteTitle={settings.siteTitle} description={settings.siteDescription} />
        </div>

        {/* No analytics ID configured means no third-party script is loaded. */}
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');`}
            </Script>
          </>
        )}
      </body>
    </html>
  );
}
