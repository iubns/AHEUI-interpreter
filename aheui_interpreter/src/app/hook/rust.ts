import { atom, useRecoilState } from "recoil"
import init, {
  InitOutput,
  run_new,
  get_cell_value,
} from "../../../public/rust/aheui_interpreter"
import useEditor from "./editor"

const rustAtom = atom<InitOutput | null>({
  key: "rust-atom",
  default: null,
})

const resultAtom = atom<string>({
  key: "result",
  default: "",
})

export default async function useRust() {
  const [rust, setRust] = useRecoilState(rustAtom)
  const [result, setResult] = useRecoilState(resultAtom)
  const { cellList } = useEditor()

  if (!rust) {
    const initRust = await init(
      "http://localhost:3000/rust/aheui_interpreter_bg.wasm"
    )
    setRust(initRust)
  }

  function runNew() {
    const rsCellList = cellList
      .map((cell) => {
        const rsCell = get_cell_value(cell.position.x, cell.position.y)
        rsCell.value = cell.value || "ㅇ"
        return rsCell
      })
      .sort((a, b) => a.position.x - b.position.x)
      .sort((a, b) => a.position.y - b.position.y)
    setResult(run_new(rsCellList).join(""))
  }

  return {
    runNew,
    result,
  }
}
