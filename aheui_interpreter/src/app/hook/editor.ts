import { atom, useRecoilState } from "recoil"
import { CellValue } from "../components/Editor/Cell"
import _ from "lodash"

const cellListAtom = atom<CellValue[]>({
  key: "cell-list",
  default: [],
})

export default function useEditor() {
  const [cellList, setCellList] = useRecoilState(cellListAtom)

  function addCell(cell: CellValue) {
    setCellList([...cellList, cell])
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
    addCell,
    removeCell,
  }
}
