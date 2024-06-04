import useAheuiCore from "@/app/hook/useAheuiCore"

export default function CurrentPosition() {
  const { nextProcessingPosition } = useAheuiCore()

  return (
    <div
      className="absolute border border-dashed"
      style={{
        border: "2px solid red",
        zIndex: "20",
        width: "30px",
        height: "30px",
        top: nextProcessingPosition.y * 30 + "px",
        left: nextProcessingPosition.x * 30 + "px",
      }}
    />
  )
}
