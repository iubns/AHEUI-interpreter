import useAheuiCore from "@/app/hook/useAheuiCore"
import { useRecoilValue } from "recoil"

export default function CurrentPosition() {
  const { processorPosition } = useAheuiCore()

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
