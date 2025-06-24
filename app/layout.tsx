import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Balaton Asszisztens",
  description:
    "AI-powered assistant for Lake Balaton, Hungary. Get personalized recommendations for beaches, restaurants, accommodations, and activities around Hungary's largest lake. Mert nekünk a Balaton a Riviéra!",
  keywords: [
    "Balaton",
    "Lake Balaton",
    "Hungary",
    "travel guide",
    "AI assistant",
    "beaches",
    "restaurants",
    "accommodation",
    "tourism",
    "Hungarian Riviera",
    "Balatonfüred",
    "Siófok",
    "Tihany",
    "Keszthely",
    "water sports",
    "vacation",
    "holiday",
    "Magyar",
    "Magyarország",
  ],
  authors: [{ name: "Balaton Asszisztens" }],
  creator: "Balaton Asszisztens",
  publisher: "Balaton Asszisztens",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "hu_HU",
    url: "https://balaton-asszisztens.vercel.app",
    siteName: "Balaton Asszisztens",
    title: "Balaton Asszisztens - AI Útmutató a Magyar Tengerhez",
    description:
      "Fedezd fel a Balatont AI segítségével! Személyre szabott ajánlások strandokhoz, éttermekhez, szállásokhoz és programokhoz. Mert nekünk a Balaton a Riviéra!",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Balaton Asszisztens - AI Útmutató a Magyar Tengerhez",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Balaton Asszisztens - AI Útmutató a Magyar Tengerhez",
    description:
      "Fedezd fel a Balatont AI segítségével! Személyre szabott ajánlások strandokhoz, éttermekhez, szállásokhoz és programokhoz.",
    images: ["/og-image.jpg"],
  },
  alternates: {
    canonical: "https://balaton-asszisztens.vercel.app",
    languages: {
      "hu-HU": "https://balaton-asszisztens.vercel.app",
      "en-US": "https://balaton-asszisztens.vercel.app/en",
    },
  },
  category: "travel",
  classification: "Travel & Tourism AI Assistant",
  other: {
    "geo.region": "HU",
    "geo.placename": "Lake Balaton, Hungary",
    "geo.position": "46.8355;17.7362",
    ICBM: "46.8355, 17.7362",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="hu" suppressHydrationWarning>
      <head>
        {/* Favicon and App Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />

        {/* Theme Color */}
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />

        {/* Additional SEO Meta Tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Balaton Asszisztens" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Balaton Asszisztens",
              description:
                "AI-powered assistant for Lake Balaton, Hungary. Get personalized recommendations for beaches, restaurants, accommodations, and activities.",
              url: "https://balaton-asszisztens.vercel.app",
              applicationCategory: "TravelApplication",
              operatingSystem: "Web Browser",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "HUF",
              },
              author: {
                "@type": "Organization",
                name: "Balaton Asszisztens",
              },
              about: {
                "@type": "Place",
                name: "Lake Balaton",
                alternateName: "Balaton",
                description: "Hungary's largest lake and most popular tourist destination",
                geo: {
                  "@type": "GeoCoordinates",
                  latitude: 46.8355,
                  longitude: 17.7362,
                },
                address: {
                  "@type": "PostalAddress",
                  addressCountry: "HU",
                  addressRegion: "Hungary",
                },
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
