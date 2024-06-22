import useAheuiCore from "@/app/hook/useAheuiCore"
import "./index.css"

export default function CurrentPosition() {
  const { nextProcessingPosition } = useAheuiCore()

  return (
    <div
      className="absolute next-execute-position"
      style={{
        top: nextProcessingPosition.y * 30 + "px",
        left: nextProcessingPosition.x * 30 + "px",
      }}
    />
  )
}
