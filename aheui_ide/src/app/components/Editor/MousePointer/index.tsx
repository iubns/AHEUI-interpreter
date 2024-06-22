import "./index.css"

interface IProps {
  mousePosition: { x: number; y: number }
}

export default function MousePointer({ mousePosition }: IProps) {
  return (
    <div
      className="absolute mouse-pointer mouse-pointer-animation "
      style={{
        top: mousePosition.y * 30 + "px",
        left: mousePosition.x * 30 + "px",
      }}
    ></div>
  )
}
