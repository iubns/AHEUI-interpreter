import { atom, useRecoilState } from "recoil"
import { CellValue } from "../components/Editor/Cell"
import _ from "lodash"
import { useEffect, useRef } from "react"
import Position from "@/interfaces/position"
import { BreakPointer } from "../../../public/aheui-core-wasm/aheui_interpreter"

const cellListAtom = atom<CellValue[]>({
  key: "cell-list",
  default: [],
})

const brakePointListAtom = atom<BreakPointer[]>({
  key: "brake-point-list",
  default: [],
})

export default function useEditor() {
  const [cellList, setCellList] = useRecoilState(cellListAtom)
  const [brakePointerList, setBreakPointerList] =
    useRecoilState(brakePointListAtom)
  const cellListRef = useRef(cellList)

  useEffect(() => {
    cellListRef.current = cellList
  }, [cellList])

  function bulkInsert(content: string, startPosition: Position) {
    let insertCellList: CellValue[] = []
    let changeCellList: CellValue[] = []
    content.split("\n").map((row, rowIndex) => {
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const foundCell = cellListRef.current.find(
          (oldCell) =>
            oldCell.position.x === startPosition.x + colIndex &&
            oldCell.position.y === startPosition.y + rowIndex
        )
        if (foundCell) {
          changeCellList.push({ ...foundCell, value: row[colIndex] })
        } else {
          insertCellList.push({
            position: {
              x: startPosition.x + colIndex,
              y: startPosition.y + rowIndex,
            },
            value: row[colIndex],
          })
        }
      }
    })

    const uniqCellList = cellListRef.current.filter((oldCell) => {
      return !changeCellList.find(
        (changeCell) =>
          changeCell.position.x === oldCell.position.x &&
          changeCell.position.y === oldCell.position.y
      )
    })
    setCellList([...uniqCellList, ...insertCellList, ...changeCellList])
  }

  function removeCell(currentCursor: CellValue) {
    const filtered = cellList.filter(
      (cell) =>
        !(
          cell.position.x === currentCursor.position.x &&
          cell.position.y === currentCursor.position.y
        )
    )
    setCellList([...filtered])
  }

  function changeCell(targeCell: CellValue) {
    const filtered = cellList.filter(
      (cell) =>
        !(
          cell.position.x === targeCell.position.x &&
          cell.position.y === targeCell.position.y
        )
    )
    setCellList([...filtered, targeCell])
  }

  function clearCellList() {
    cellListRef.current = []
    setCellList([])
  }

  function togglePoint(position: Position) {
    const foundBP = brakePointerList.find(
      (bp) => bp.position.x === position.x && bp.position.y === position.y
    )
    if (foundBP) {
      setBreakPointerList([
        ...brakePointerList.filter(
          (bp) => bp.position.x !== position.x && bp.position.y !== position.y
        ),
      ])
    } else {
      const newBP = { position, free: () => {} } as BreakPointer
      setBreakPointerList([...brakePointerList, newBP])
    }
  }

  return {
    cellList,
    togglePoint,
    brakePointerList,
    changeCell,
    bulkInsert,
    clearCellList,
    removeCell,
  }
}
