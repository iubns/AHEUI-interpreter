import Position from "@/interfaces/position"
import "./index.css"

export interface CellValue {
  position: Position
  value?: string
}

interface IProps extends CellValue {}

export default function Cell({ position, value }: IProps) {
  return (
    <div
      className="text-center absolute cell-style"
      style={{
        top: position.y * 30 + "px",
        left: position.x * 30 + "px",
      }}
    >
      {value}
    </div>
  )
}
