import { useState } from "react"
import useRust from "../hook/rust"

export default function Controller() {
  const rustHook = useRust()

  async function runCmd() {
    const { runNew } = await rustHook
    runNew()
  }

  return (
    <div className="flex flex-row gap-4">
      <button>한단계 실행</button>
      <button>디버깅 모드로 실행</button>
      <button onClick={runCmd}>전체 실행</button>
    </div>
  )
}
