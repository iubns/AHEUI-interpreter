"use client"

import { useState } from "react"
import Controller from "./components/Controller"
import Editor from "./components/Editor"

export default function Home() {
  const [result, setResult] = useState("")

  return (
    <div className="flex flex-col">
      <Controller />
      <Editor />
      <pre>{result}</pre>
    </div>
  )
}
