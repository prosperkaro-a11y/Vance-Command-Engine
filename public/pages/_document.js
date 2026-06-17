// pages/_document.js
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Meta tags */}
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#1A1208" />
        <meta name="description" content="VANCE OS – Voice-Activated Neural Command Engine" />
        <meta name="keywords" content="AI, assistant, voice, command, VANCE, Prosper" />
        <meta name="author" content="Prosper (The Senator)" />

        {/* Open Graph / Social Media */}
        <meta property="og:title" content="VANCE OS" />
        <meta property="og:description" content="Your personal AI chief of staff" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://vance-os.vercel.app" />
        <meta property="og:image" content="/og-image.png" />

        {/* Favicon (you can add your own) */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Preconnect to Google Fonts (used in the app) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800&family=Share+Tech+Mono&family=Crimson+Pro:wght@400;600&display=swap"
          rel="stylesheet"
        />

        {/* Add any additional head elements here */}
      </Head>

      <body>
        {/* The Main component renders your pages */}
        <Main />

        {/* NextScript injects the necessary JavaScript */}
        <NextScript />
      </body>
    </Html>
  );
}
