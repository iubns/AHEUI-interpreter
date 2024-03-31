import { ChangeEvent, MouseEvent, useRef, useState } from "react"
import Cell, { CellValue } from "./Cell"
import MousePointer from "./MousePointer"
import Position from "@/interfaces/position"
import Cursor from "./Cursor"
import _ from "lodash"

export default function Editor() {
  const hiddenRef = useRef<HTMLInputElement>(null)
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 })
  const [currentCursor, setCurrentCursor] = useState<CellValue>({
    position: { x: -1, y: -1 },
    value: "",
  })
  const [cellValueList, setCellValueList] = useState<CellValue[]>([
    { position: { x: 0, y: 2 }, value: "망" },
  ])
  const [v, sv] = useState(0)

  function mouseMove(e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) {
    const x = e.pageX - e.currentTarget.offsetLeft
    const y = e.pageY - e.currentTarget.offsetTop
    setMousePosition({ x: Math.floor(x / 30), y: Math.floor(y / 30) })
  }

  function clickCell() {
    const foundCell = cellValueList.find(
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
      currentCursor.value = e.target.value[1]
    } else {
      currentCursor.value = e.target.value
    }

    const hasCell = cellValueList.find(
      (cell) =>
        cell.position.x === currentCursor.position.x &&
        cell.position.y === currentCursor.position.y
    )
    if (e.target.value.length > 0 && !hasCell) {
      setCellValueList([...cellValueList, currentCursor])
    } else if (e.target.value.length === 0) {
      _.remove(
        cellValueList,
        (cell) =>
          cell.position.x === currentCursor.position.x &&
          cell.position.y === currentCursor.position.y
      )
    }
    setCellValueList([...cellValueList])

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
      {cellValueList.map((cellValue) => (
        <Cell
          key={`${cellValue.position.x}_${cellValue.position.y}`}
          position={cellValue.position}
          value={cellValue.value}
        />
      ))}
      <Cell position={{ x: 0, y: 0 }} value="방" />
      <Cell position={{ x: 1, y: 1 }} value="방" />
      <Cell position={{ x: 2, y: 2 }} value="방" />
    </div>
  )
}
