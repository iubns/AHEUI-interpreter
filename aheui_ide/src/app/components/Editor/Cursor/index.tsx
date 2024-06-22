import Position from "@/interfaces/position"
import "./index.css"

interface IProps {
  position: Position
}

export default function Cursor({ position }: IProps) {
  return (
    <div
      className="border border-solid absolute cursor cursor-animation"
      style={{
        top: position.y * 30 + "px",
        left: position.x * 30 + "px",
      }}
    ></div>
  )
}
