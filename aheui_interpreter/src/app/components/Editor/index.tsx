import { ChangeEvent, MouseEvent, useRef, useState } from "react"
import Cell, { CellValue } from "./Cell"
import MousePointer from "./MousePointer"
import Position from "@/interfaces/position"
import Cursor from "./Cursor"
import _ from "lodash"
import useEditor from "@/app/hook/editor"

export default function Editor() {
  const { cellList, addCell, removeCell } = useEditor()
  const hiddenRef = useRef<HTMLInputElement>(null)
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 })
  const [currentCursor, setCurrentCursor] = useState<CellValue>({
    position: { x: -1, y: -1 },
    value: "",
  })
  const [v, sv] = useState(0)

  function mouseMove(e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) {
    const x = e.pageX - e.currentTarget.offsetLeft
    const y = e.pageY - e.currentTarget.offsetTop
    setMousePosition({ x: Math.floor(x / 30), y: Math.floor(y / 30) })
  }

  function clickCell() {
    const foundCell = cellList.find(
      (cell) =>
        cell.position.x === mousePosition.x &&
        cell.position.y === mousePosition.y
    )
    if (foundCell) {
      setCurrentCursor(foundCell)
    } else {
      setCurrentCursor({ position: mousePosition, value: "" })
    }
    hiddenRef.current?.focus()
  }

  function changeCommand(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.value.length > 1) {
      setCurrentCursor({
        ...currentCursor,
        value: e.target.value[1],
      })
    } else {
      setCurrentCursor({
        ...currentCursor,
        value: (currentCursor.value = e.target.value),
      })
    }

    const hasCell = cellList.find(
      (cell) =>
        cell.position.x === currentCursor.position.x &&
        cell.position.y === currentCursor.position.y
    )
    if (e.target.value.length > 0 && !hasCell) {
      addCell(currentCursor)
    } else if (e.target.value.length === 0) {
      removeCell(currentCursor)
    }

    sv(v + 1)
  }

  return (
    <div
      className="relative"
      style={{
        backgroundColor: "black",
        height: "100px",
      }}
      onMouseMove={mouseMove}
      onClick={clickCell}
    >
      {v}
      <input
        type="text"
        ref={hiddenRef}
        value={currentCursor.value}
        onChange={changeCommand}
      />
      <Cursor position={currentCursor.position} />
      <MousePointer mousePosition={mousePosition} />
      {cellList.map((cellValue) => (
        <Cell
          key={`${cellValue.position.x}_${cellValue.position.y}`}
          position={cellValue.position}
          value={cellValue.value}
        />
      ))}
    </div>
  )
}
