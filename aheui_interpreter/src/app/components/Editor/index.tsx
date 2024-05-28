import { ChangeEvent, KeyboardEvent, MouseEvent, useRef, useState } from "react"
import Cell, { CellValue } from "./Cell"
import MousePointer from "./MousePointer"
import Position from "@/interfaces/position"
import Cursor from "./Cursor"
import _ from "lodash"
import useEditor from "@/app/hook/editor"
import CurrentPosition from "./CurrentPosition"

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
    setValueToCursor({ x: mousePosition.x, y: mousePosition.y })
    hiddenRef.current?.focus()
    sv(v + 1)
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

    changeCell({
      position: {
        x: currentCursor.position.x,
        y: currentCursor.position.y,
      },
      value: lastChar,
    })
    sv(v + 1)
  }

  function setValueToCursor({ x, y }: Position) {
    const foundCell = cellList.find(
      (cell) => cell.position.x === x && cell.position.y === y
    )
    currentCursor.position.x = x
    currentCursor.position.y = y
    setInputValue(foundCell ? foundCell.value || "" : "")
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.keyCode === 229) return
    switch (e.code) {
      case "Enter":
        currentCursor.position.x = currentCursor.position.x + 1
        break
      case "ArrowLeft":
        currentCursor.position.x = currentCursor.position.x - 1
        break
      case "ArrowUp":
        currentCursor.position.y = currentCursor.position.y - 1
        break
      case "ArrowRight":
        currentCursor.position.x = currentCursor.position.x + 1
        break
      case "ArrowDown":
        currentCursor.position.y = currentCursor.position.y + 1
        break
      case "Delete":
        setInputValue("")
        removeCell(currentCursor)
        setPreLength(0)
        break
    }
    if (e.code === "Enter" || e.code.startsWith("Arrow")) {
      setValueToCursor({
        x: currentCursor.position.x,
        y: currentCursor.position.y,
      })
      hiddenRef.current?.focus()
      e.preventDefault()
    }
    sv(v + 1)
  }

  return (
    <div
      className="relative"
      style={{
        backgroundColor: "black",
        height: "100px",
        zIndex: "10",
      }}
      onMouseMove={mouseMove}
      onClick={clickCell}
    >
      <input
        type="text"
        style={{ zIndex: 0 }}
        onKeyDown={onKeyDown}
        ref={hiddenRef}
        value={inputValue}
        onChange={changeCommand}
      />
      <Cursor position={currentCursor.position} />
      <MousePointer mousePosition={mousePosition} />
      <CurrentPosition />
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
