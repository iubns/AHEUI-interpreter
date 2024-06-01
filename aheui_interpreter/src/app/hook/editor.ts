import { atom, useRecoilState } from "recoil"
import { CellValue } from "../components/Editor/Cell"
import _ from "lodash"
import { useRef } from "react"

const cellListAtom = atom<CellValue[]>({
  key: "cell-list",
  default: [],
})

export default function useEditor() {
  const [cellList, setCellList] = useRecoilState(cellListAtom)
  const cellListRef = useRef(cellList)

  function bulkUpdate(updateCellList: CellValue[]) {
    console.log(cellListRef.current)
    let tempCellList: CellValue[] = []
    for (const cell of updateCellList) {
      const foundCell = cellList.find(
        (oldCell) =>
          oldCell.position.x === cell.position.x &&
          oldCell.position.y === cell.position.y
      )
      if (foundCell) {
        foundCell.value = cell.value
      } else {
        tempCellList.push(cell)
      }
    }
    setCellList([...cellList, ...tempCellList])
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

  return {
    cellList,
    changeCell,
    bulkUpdate,
    removeCell,
  }
}
