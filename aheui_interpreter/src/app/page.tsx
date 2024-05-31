"use client"

import { EventHandler, MouseEvent, useState } from "react"
import Controller from "./components/Controller"
import Editor from "./components/Editor"
import ResultArea from "./components/ResultArea"
import Menu from "./components/Menu"

export default function Home() {
  const [isMoveMode, setMoveMode] = useState(false)
  const [editorHeight, setEditorHeight] = useState(20 * 30)

  function onMouseDownDivider() {
    setMoveMode(true)
  }

  function onMouseMove(e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>) {
    const cellSize = Math.round((e.pageY - 30) / 30)
    if (isMoveMode) setEditorHeight(cellSize * 30)
  }
  function onMouseUpDivider() {
    setMoveMode(false)
  }

  return (
    <div className="flex flex-col h-full">
      <Controller />
      <div className="flex flex-row h-full bg-gray-700">
        <Menu />
        <div
          className="flex flex-col h-full flex-grow"
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUpDivider}
        >
          <Editor editorHeight={editorHeight} isMoveMode={isMoveMode} />
          <div
            onMouseDown={onMouseDownDivider}
            className="h-2 bg-blue-800 cursor-row-resize z-30"
          />
          <ResultArea />
        </div>
      </div>
    </div>
  )
}
