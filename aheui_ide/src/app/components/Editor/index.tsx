import {
  ChangeEvent,
  KeyboardEvent,
  MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react"
import Cell, { CellValue } from "./Cell"
import MousePointer from "./MousePointer"
import Position from "@/interfaces/position"
import Cursor from "./Cursor"
import _ from "lodash"
import useEditor from "@/app/hook/useEditor"
import CurrentPosition from "./CurrentPosition"

const currentCursor: CellValue = { position: { x: -1, y: -1 }, value: "" }

interface IProps {
  editorHeight: number
  isMoveMode: boolean
}

export default function Editor({ editorHeight, isMoveMode }: IProps) {
  const { cellList, bulkUpdate, removeCell, changeCell } = useEditor()
  const hiddenRef = useRef<HTMLInputElement>(null)
  const [mousePosition, setMousePosition] = useState<Position>({ x: 0, y: 0 })
  const [preLength, setPreLength] = useState(0)
  const [inputValue, setInputValue] = useState("")

  const [v, sv] = useState(0)

  useEffect(() => {
    window.addEventListener("paste", paste)
    return () => {
      window.removeEventListener("paste", paste)
    }
  }, [])

  function paste(event: ClipboardEvent) {
    const paste = event.clipboardData?.getData("text")
    if (!paste) return

    let tempCellList: CellValue[] = []
    paste.split("\n").map((row, rowIndex) => {
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        tempCellList.push({
          position: {
            x: currentCursor.position.x + colIndex,
            y: currentCursor.position.y + rowIndex,
          },
          value: row[colIndex],
        })
      }
    })
    bulkUpdate(tempCellList)
    sv(v + 1)

    event.preventDefault()
  }

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

    if (preLength !== e.target.value.length && preLength > 0) {
      changeCell({
        position: {
          x: currentCursor.position.x,
          y: currentCursor.position.y,
        },
        value: e.target.value[preLength - 1],
      })
      currentCursor.position.x++
    }
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
        currentCursor.position.y++
        break
      case "ArrowLeft":
        if (currentCursor.position.x > 0) {
          currentCursor.position.x--
        }
        break
      case "ArrowUp":
        if (currentCursor.position.y > 0) {
          currentCursor.position.y--
        }
        break
      case "ArrowRight":
        currentCursor.position.x++
        break
      case "ArrowDown":
        currentCursor.position.y++
        break
      case "Delete":
        setInputValue("")
        removeCell(currentCursor)
        setPreLength(0)
        break
      case "Backspace":
        if (inputValue.length === 0) {
          removeCell(currentCursor)
          if (currentCursor.position.x > 0) {
            currentCursor.position.x--
          }
        }
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
      className="relative z-10 overflow-scroll"
      style={{
        height: `${editorHeight}px`,
      }}
      onMouseMove={mouseMove}
      onClick={clickCell}
    >
      <input
        type="text"
        style={{
          zIndex: 0,
          position: "fixed",
          height: 1,
          top: 0,
        }}
        onKeyDown={onKeyDown}
        ref={hiddenRef}
        value={inputValue}
        onChange={changeCommand}
      />
      <Cursor position={currentCursor.position} />
      {!isMoveMode && <MousePointer mousePosition={mousePosition} />}
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
