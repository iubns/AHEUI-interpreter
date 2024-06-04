"use client"

import { RecoilRoot } from "recoil"

export default function RecoilWrapper({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <RecoilRoot>{children}</RecoilRoot>
}
