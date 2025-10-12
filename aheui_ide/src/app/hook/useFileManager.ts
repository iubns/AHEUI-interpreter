import useEditor from "./useEditor"
import { useRef, useEffect } from "react"
import { atom, useRecoilState } from "recoil"
import { CellValue } from "../components/Editor/Cell"

export interface FileItem {
    name: string
    content: CellValue[]
    isEditing: boolean
    isDontSave?: boolean
}

const fileListAtom = atom<FileItem[]>({
    key: 'fileList',
    default: [],
});

const activeFileIndexAtom = atom<number | null>({
    key: 'activeFileIndex',
    default: null,
});

export default function useFileManager() {
  const [files, setFiles] = useRecoilState(fileListAtom)
  const [activeFileIndex, setActiveFileIndex] = useRecoilState(activeFileIndexAtom)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { bulkInsert, isUpdated, cellList, setIsUpdated } = useEditor()

  function openFileDialog() {
    fileInputRef.current?.click()
  }

  useEffect(() => {
    const editingFile = files.find((f) => f.isEditing)
    if (editingFile) {
      setEditingFile(cellList)
      setIsUpdated(false)
    }
  }, [isUpdated])

  useEffect(() => {
    if (activeFileIndex === null) {
      return
    }
    setFiles(prev => prev.map((f, i) => ({ ...f, isEditing: i === activeFileIndex })))
  }, [activeFileIndex])

  function openNewFile() {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const content = reader.result as string
        bulkInsert(content, { x: 0, y: 0 })
        setFiles((prev) => {
          return [
            ...prev.map(f => ({ ...f, isEditing: false })),
            { name: file.name, content: [], isEditing: true },
          ]
        })
        setActiveFileIndex(files.length)
      }
      reader.readAsText(file)
    }
  }

    function setActiveFile(idx: number) {
        setActiveFileIndex(idx)
    }

    function setEditingFile(content: CellValue[]) {
        setFiles((prev) => {
            const idx = prev.findIndex((f) => f.isEditing)
            if (idx === -1) return prev
            const updated = [...prev]
            updated[idx] = { ...updated[idx], content }
            return updated
        })
    }

    function createNewFile(name?: string) {
        // Find the next available number for '새파일'
        const base = "새파일_"
        const ext = ".aheui"
        let num = 1
        let newName = name || `${base}${num}${ext}`
        const existingNames = files.map((f) => f.name)
        while (existingNames.includes(newName)) {
            num++
            newName = `${base}${num}${ext}`
        }
        setFiles((prev) => [
            ...prev,
            { name: newName, content: [], isEditing: true },
        ])
        setActiveFileIndex(files.length)
    }

    function downloadFile(idx: number) {
        const file = files[idx]
        if (!file) return
        const rows: Record<number, Record<number, string>> = {}
        file.content.forEach(cell => {
            if (!rows[cell.position.y]) rows[cell.position.y] = {}
            rows[cell.position.y][cell.position.x] = cell.value ?? " "
        })

        const maxRow = Math.max(...Object.keys(rows).map(Number), 0)
        const maxCol = Math.max(...Object.values(rows).flatMap(row => Object.keys(row).map(Number)), 0)

        const lines = []
        for (let y = 0; y <= maxRow; y++) {
            let line = ""
            for (let x = 0; x <= maxCol; x++) {
                line += rows[y]?.[x] ?? " "
            }
            lines.push(line)
        }
        const blob = new Blob([lines.join("\n")], { type: "text/plain" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = file.name
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    function renameFile(idx: number, newName: string) {
        setFiles((prev) => {
            const updated = [...prev]
            if (updated[idx]) {
                updated[idx] = { ...updated[idx], name: newName }
            }
            return updated
        })
    }

    function removeFile(idx: number) {
        setFiles((prev) => prev.filter((_, i) => i !== idx))

        setActiveFileIndex((prevIdx) => {
            if (prevIdx === idx) {
                if (idx > 0) return idx - 1
                else if (files.length > 1) return 0
                else return null
            }
            if (prevIdx !== null && prevIdx > idx) return prevIdx - 1
            return prevIdx
        })
    }

    return {
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
    }
}
