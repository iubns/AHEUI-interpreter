import { atom, useRecoilState } from "recoil"
import init, {
  InitOutput,
  run_cmd,
  run_new,
  get_cell_value,
} from "../../../public/rust/aheui_interpreter"
import useEditor from "./editor"

const rustAtom = atom<InitOutput | null>({
  key: "rust-atom",
  default: null,
})

export default async function useRust() {
  const [rust, setRust] = useRecoilState(rustAtom)
  const { cellList } = useEditor()

  if (!rust) {
    const initRust = await init(
      "http://localhost:3000/rust/aheui_interpreter_bg.wasm"
    )
    setRust(initRust)
  }

  function runNew() {
    //Todo: 구멍 채우기 필요.
    const rsCellList = cellList
      .map((cell) => {
        const rsCell = get_cell_value()
        //Todo: 왜 안들어 가는가?
        rsCell.position.x = cell.position.x
        rsCell.position.y = cell.position.y
        rsCell.value = cell.value || "ㅇ"
        return rsCell
      })
      .sort((a, b) => a.position.x - b.position.x)
      .sort((a, b) => a.position.y - b.position.y)
    return run_new(rsCellList)
  }

  return {
    runNew,
    run_cmd,
  }
}
