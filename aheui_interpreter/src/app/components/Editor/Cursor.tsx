import Position from "@/interfaces/position"

interface IProps {
  position: Position
}

export default function Cursor({ position }: IProps) {
  return (
    <div
      className="border border-solid absolute"
      style={{
        width: "30px",
        height: "30px",
        top: position.y * 30 + "px",
        left: position.x * 30 + "px",
      }}
    ></div>
  )
}
