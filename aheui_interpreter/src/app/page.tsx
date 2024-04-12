"use client"

import { useState } from "react"
import useRust from "./hook/rust"
import Controller from "./components/Controller"
import Editor from "./components/Editor"

export default function Home() {
  const [result, setResult] = useState("")

  const rust = useRust()
  rust.then((r) => {
    setResult(r.result)
  })

  return (
    <div className="flex flex-col">
      <Controller />
      <Editor />
      <pre>{result}</pre>
    </div>
  )
}
