import useRust, { processorPositionAtom } from "@/app/hook/rust"
import { useEffect, useState } from "react"
import { Position } from "../../../../public/rust/aheui_interpreter"
import { useRecoilValue } from "recoil"

export default function CurrentPosition() {
  const processorPosition = useRecoilValue(processorPositionAtom)

  return (
    <div
      className="absolute border border-dashed"
      style={{
        border: "2px solid red",
        zIndex: "20",
        width: "30px",
        height: "30px",
        top: processorPosition.y * 30 + "px",
        left: processorPosition.x * 30 + "px",
      }}
    />
  )
}
