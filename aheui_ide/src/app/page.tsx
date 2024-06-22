"use client"

import { MouseEvent, useEffect, useRef, useState } from "react"
import Controller from "./components/Controller"
import Editor from "./components/Editor"
import Menu from "./components/Menu"
import useAheuiCore from "./hook/useAheuiCore"
import Bottom from "./components/Bottom"
import StatusBar from "./components/StatusBar"

export default function Home() {
  const [isMoveMode, setMoveMode] = useState(false)
  const [editorHeight, setEditorHeight] = useState(20 * 30)
  const aheuiCore = useAheuiCore()
  const aheuiCoreRef = useRef(aheuiCore)

  aheuiCoreRef.current = aheuiCore

  useEffect(() => {
    if (document) {
      document.onkeydown = (event) => {
        switch (event.key) {
          case "F10":
            aheuiCoreRef.current.startOne()
            event.preventDefault()
            break
          case "F5":
            aheuiCoreRef.current.startWithDebug()
            event.preventDefault()
            break
        }
      }
    }
  }, [])

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
      <div className="flex flex-row h-full" style={{ backgroundColor: "#333" }}>
        <Menu />
        <div
          className="flex flex-col flex-grow h-full"
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUpDivider}
        >
          <Editor editorHeight={editorHeight} isMoveMode={isMoveMode} />
          <div
            onMouseDown={onMouseDownDivider}
            className="h-2 bg-blue-800 cursor-row-resize z-30"
          />
          <Bottom />
        </div>
      </div>
      <StatusBar />
    </div>
  )
}
