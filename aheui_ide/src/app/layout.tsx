import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import RecoilWrapper from "./components/RecoilWrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <title>겁나 빠른 아희 인터프리터</title>
      </head>
      <RecoilWrapper>
        <body className={inter.className}>{children}</body>
      </RecoilWrapper>
    </html>
  )
}
