"use client"

import { MouseEvent, useEffect, useState } from "react"
import Controller from "./components/Controller"
import Editor from "./components/Editor"
import ResultArea from "./components/Output"
import Menu from "./components/Menu"
import StatusBar from "./components/StatusBar"
import useRust from "./hook/useAheuiCore"
import Bottom from "./components/Bottom"

export default function Home() {
  const [isMoveMode, setMoveMode] = useState(false)
  const [editorHeight, setEditorHeight] = useState(20 * 30)
  const rustHook = useRust()

  async function runCmd(type: string) {
    const { startAll, startOne, initProcessor } = await rustHook
    switch (type) {
      case "one":
        startOne()
        break
      case "all":
        startAll()
        break
      case "init":
        initProcessor()
        break
    }
  }

  useEffect(() => {
    if (document) {
      document.onkeydown = (event) => {
        switch (event.key) {
          case "F10":
            runCmd("one")
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
      <div className="flex flex-row h-full bg-gray-700">
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
    </div>
  )
}
