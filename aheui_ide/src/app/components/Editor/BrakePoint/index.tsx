import Position from "@/interfaces/position"
import "./index.css"

interface IProps {
  position: Position
}

export default function BrakePoint({ position }: IProps) {
  return (
    <div
      className="border border-solid absolute brake-pointe"
      style={{
        top: position.y * 30 + "px",
        left: position.x * 30 + "px",
      }}
    ></div>
  )
}
