import './globals.css';

import PWAInstallPrompt from './components/PWAInstallPrompt';
import ServiceWorkerRegister from './components/ServiceWorkerRegister';

import Script from 'next/script';

export const metadata = {
  title: 'Ortaköy Kumrucusu | Dijital Menü',
  description: 'Ortaköy Kumrucusu Burhaniye - Premium fast food, kumru, kumpir, tost, burger ve daha fazlası. Online sipariş verin!',
  manifest: '/manifest.json',
  themeColor: '#ffaa00',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Ortaköy Kumrucusu',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body>
        <div id="google_translate_element" style={{ opacity: 0, position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}></div>
        <Script id="google-translate-init" strategy="beforeInteractive">
          {`
            function googleTranslateElementInit() {
              new google.translate.TranslateElement({
                pageLanguage: 'tr',
                includedLanguages: 'tr,en,ar,ru,de',
                autoDisplay: false
              }, 'google_translate_element');
            }
          `}
        </Script>
        <Script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit" strategy="afterInteractive" />
        
        {children}
        <PWAInstallPrompt />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
