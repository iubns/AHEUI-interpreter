import Position from "@/interfaces/position"

export interface CellValue {
  position: Position
  value?: string
}

interface IProps extends CellValue {}

export default function Cell({ position, value }: IProps) {
  return (
    <div
      className="border border-solid text-center absolute"
      style={{
        top: position.y * 30 + "px",
        left: position.x * 30 + "px",
        width: "30px",
        height: "30px",
        color: "wheat",
      }}
    >
      {value}
    </div>
  )
}
