import { useState } from "react"
import useRust from "../hook/rust"

export default function Controller() {
  const rustHook = useRust()

  async function runCmd(type: string) {
    const { startAll, startOne } = await rustHook
    switch (type) {
      case "one":
        startOne()
        break
      case "all":
        startAll()
        break
    }
  }

  return (
    <div className="flex flex-row gap-4">
      <button onClick={() => runCmd("one")}>한단계 실행</button>
      <button>디버깅 모드로 실행</button>
      <button onClick={() => runCmd("all")}>전체 실행</button>
    </div>
  )
}
