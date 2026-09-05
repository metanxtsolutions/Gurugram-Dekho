import type { Metadata } from 'next';
import Script from 'next/script';
import { League_Spartan, Rubik } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { getSettings } from '@/lib/settings';

/* The two faces KolkataDekho uses: League Spartan for display, Rubik for body. */
const leagueSpartan = League_Spartan({
  variable: '--font-league-spartan',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
});

const rubik = Rubik({
  variable: '--font-rubik',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

/*
  Applies the saved theme before first paint. Without this the page renders
  light, then flips, which is worse than having no toggle at all. Kept tiny and
  wrapped so a blocked localStorage (private mode) falls back to the system
  preference rather than throwing.
*/
const THEME_BOOT = `(function(){try{var t=localStorage.getItem('gd-theme');if(!t)t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

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
    <html
      lang="en"
      data-theme="light"
      suppressHydrationWarning
      className={`${leagueSpartan.variable} ${rubik.variable}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#f49f00" />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body className="min-h-screen bg-page text-fg antialiased">
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
