"use client"

import { useState } from "react"
import useRust from "./hook/rust"
import Controller from "./components/Controller"
import Editor from "./components/Editor"

export default function Home() {
  const [result, setResult] = useState("")
  const rustHook = useRust()

  async function runCmd() {
    const { runNew } = await rustHook
    const t = runNew()
    console.log(t)
  }

  return (
    <div className="flex flex-col">
      <Controller />
      <Editor />
      <button onClick={runCmd}>실행</button>
      <pre>{result}</pre>
    </div>
  )
}
