import { atom, useRecoilState } from "recoil"
import { CellValue } from "../components/Editor/Cell"
import _ from "lodash"

const cellListAtom = atom<CellValue[]>({
  key: "cell-list",
  default: [
    {
      position: { x: 0, y: 2 },
      value: "박",
    },
  ],
})

export default function useEditor() {
  const [cellList, setCellList] = useRecoilState(cellListAtom)

  function addCell(cell: CellValue) {
    setCellList([...cellList, cell])
  }

  function removeCell(currentCursor: CellValue) {
    const filtered = cellList.filter(
      (cell) =>
        cell.position.x !== currentCursor.position.x &&
        cell.position.y !== currentCursor.position.y
    )
    setCellList(filtered)
  }

  return {
    cellList,
    addCell,
    removeCell,
  }
}
