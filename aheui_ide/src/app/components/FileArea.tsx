import { useEffect, useState } from "react"
import useEditor from "../hook/useEditor"
import useFileManager from "../hook/useFileManager"

export default function FileArea() {
  const { setCellList, clearCellList } = useEditor()
  const {
    files,
    activeFileIndex,
    setActiveFile,
    fileInputRef,
    openFileDialog,
    openNewFile,
    createNewFile,
    downloadFile,
    renameFile,
    removeFile,
  } = useFileManager()

  const [renamingIdx, setRenamingIdx] = useState<number | null>(null)
  const [renameValue, setRenameValue] = useState("")

  useEffect(() => {
    if (!files.some((f) => f.isEditing)) {
      createNewFile()
    }
  }, [])

  function onShowFile(idx: number) {
    setActiveFile(idx)
    clearCellList()
    setCellList(files[idx].content)
  }

  function startRenaming(idx: number, name: string) {
    setRenamingIdx(idx)
    setRenameValue(name)
  }
  function finishRenaming(idx: number) {
    if (renameValue.trim()) {
      renameFile(idx, renameValue.trim())
    }
    setRenamingIdx(null)
    setRenameValue("")
  }

  function handleRemoveFile(idx: number) {
    const file = files[idx]
    if (window.confirm(`'${file.name}' 파일을 닫으시겠습니까? 변경사항이 저장되지 않을 수 있습니다.`)) {
      removeFile(idx)
    }
  }

  return (
    <div className="p-2 flex flex-col gap-2 h-full">
      <input
        type="file"
        accept=".aheui,.txt"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={openNewFile()}
      />
      <div className="flex flex-row gap-2 mb-2 text-sm"
      >
        <button
          onClick={openFileDialog}
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded border border-gray-600"
        >
          <span className="mr-1">📂</span> 파일 열기
        </button>
        <button
          onClick={() => createNewFile()}
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded border border-gray-600"
        >
          <span className="mr-1">📝</span> 새 파일
        </button>
        {activeFileIndex !== null && files[activeFileIndex] && (
          <button
            onClick={() => downloadFile(activeFileIndex)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded border border-gray-600"
          >
            <span className="mr-1">⬇️</span> 다운로드
          </button>
        )}
      </div>
      <div
        className="rounded p-2 border border-gray-700 flex flex-col min-w-[200px]"
        style={{ height: "100%", backgroundColor: 'rgba(0, 0, 0, 0.2)' }}
      >
        <div className="text-xs text-gray-400 mb-2 font-bold">파일 목록</div>
        <div className="flex flex-col gap-1 flex-1 overflow-y-auto">
          {files.length === 0 && (
            <div className="text-gray-500 text-xs">파일이 없습니다.</div>
          )}
          {files.map((file, idx) => (
            <div key={file.name + idx} className="relative flex items-center group">
              {renamingIdx === idx ? (
                <input
                  className={`w-full px-3 py-2 rounded bg-gray-900 border border-blue-400 text-xs font-mono mb-1 text-blue-300`}
                  style={{ minWidth: 80 }}
                  value={renameValue}
                  autoFocus
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={() => finishRenaming(idx)}
                  onKeyDown={e => {
                    if (e.key === "Enter") finishRenaming(idx)
                  }}
                />
              ) : (
                <>
                  <button
                    onClick={() => onShowFile(idx)}
                    onDoubleClick={() => startRenaming(idx, file.name)}
                    className={`w-full text-left px-3 py-2 rounded bg-gray-900 border border-gray-700 text-xs font-mono transition-colors duration-100 mb-1 ${file.isEditing ? "bg-blue-900 text-blue-300 font-bold" : file.isDontSave ? "bg-green-900 text-green-300" : "text-gray-300"}`}
                    style={{ minWidth: 80 }}
                    title="더블클릭으로 이름 변경"
                  >
                    {file.isDontSave ? "● " : ""}{file.name}
                  </button>
                  <button
                    onClick={() => handleRemoveFile(idx)}
                    className="ml-1 text-gray-500 hover:text-red-400 text-xs px-1 py-0 rounded focus:outline-none"
                    title="파일 닫기"
                  >
                    ×
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
