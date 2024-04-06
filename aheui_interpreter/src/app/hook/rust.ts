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
    const cell = cellList[0]
    if (!cell) return
    //const cellValue = get_cell_value()
    const list = [get_cell_value(), get_cell_value(), get_cell_value()]
    list[0].value = "박"
    list[1].value = "망"
    list[2].value = "해"
    return run_new(list)
  }

  return {
    runNew,
    run_cmd,
  }
}
