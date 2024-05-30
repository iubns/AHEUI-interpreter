"use client"

import Controller from "./components/Controller"
import Editor from "./components/Editor"
import { useRecoilState } from "recoil"
import { resultAtom } from "./hook/rust"

export default function Home() {
  const result = useRecoilState(resultAtom)

  return (
    <div className="flex flex-col">
      <Controller />
      <Editor />
      <pre>
        {result.map((r) => (
          <>{r}</>
        ))}
      </pre>
    </div>
  )
}
