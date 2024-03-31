"use client"

import { useState } from "react"
import useRust from "../../hooks/rust"
import Controller from "./components/Controller"
import Editor from "./components/Editor"

export default function Home() {
  const [cmd, setCMD] = useState("박망해")
  const [result, setResult] = useState("")
  const rust = useRust()

  async function runCmd() {
    const { run_cmd } = await rust
    const t = run_cmd(cmd)
    setResult(t.join(""))
  }

  return (
    <div className="flex flex-col">
      <Controller />
      <Editor />
      <div>
        <textarea
          style={{
            backgroundColor: "black",
            borderColor: "white",
            borderWidth: "1px",
            height: "400px",
          }}
          value={cmd}
          onChange={(e) => setCMD(e.target.value)}
        />
        <button onClick={runCmd}>실행</button>
        <pre>{result}</pre>
      </div>
    </div>
  )
}
