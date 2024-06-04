interface IProps {
  mousePosition: { x: number; y: number }
}

export default function MousePointer({ mousePosition }: IProps) {
  return (
    <div
      className="absolute border border-dashed"
      style={{
        width: "30px",
        height: "30px",
        top: mousePosition.y * 30 + "px",
        left: mousePosition.x * 30 + "px",
      }}
    ></div>
  )
}
