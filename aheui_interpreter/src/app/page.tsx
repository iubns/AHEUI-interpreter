"use client"

import { useEffect, useState } from "react"
import useRust from "../../hooks/rust"

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
    <div>
      겁나 빠른 아희 인터프리터
      <div className="flex flex-col">
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
