import { ChangeEvent, KeyboardEvent, MouseEvent, useRef, useState } from "react"
import Cell, { CellValue } from "./Cell"
import MousePointer from "./MousePointer"
import Position from "@/interfaces/position"
import Cursor from "./Cursor"
import _ from "lodash"
import useEditor from "@/app/hook/editor"

const currentCursor: CellValue = { position: { x: -1, y: -1 }, value: "" }

export default function Editor() {
  const { cellList, addCell, removeCell, changeCell } = useEditor()
  const hiddenRef = useRef<HTMLInputElement>(null)
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 })
  const [preLength, setPreLength] = useState(0)
  const [inputValue, setInputValue] = useState("")

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
      currentCursor.position = foundCell.position
      currentCursor.value = foundCell.value
    } else {
      currentCursor.position = mousePosition
      currentCursor.value = ""
    }
    hiddenRef.current?.focus()
  }

  function changeCommand(e: ChangeEvent<HTMLInputElement>) {
    setPreLength(e.target.value.length)
    if (preLength > e.target.value.length) {
      setInputValue("")
      removeCell(currentCursor)
      setPreLength(0)
      sv(v + 1)
      return
    }
    setInputValue(e.target.value)

    const lastChar = e.target.value[e.target.value.length - 1]

    changeCell({ ...currentCursor, value: lastChar })

    sv(v + 1)
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    console.log(e.code)
    if (e.code === "Enter") {
      setMousePosition({
        x: currentCursor.position.x + 1,
        y: currentCursor.position.y,
      })
      setTimeout(clickCell, 0)
      sv(v + 1)
    }
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
        onKeyDown={onKeyDown}
        ref={hiddenRef}
        value={inputValue}
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
