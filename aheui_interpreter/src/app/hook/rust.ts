import { atom, useRecoilState } from "recoil"
import init, {
  InitOutput,
  run_new,
  get_cell_value,
  Position,
  Processor,
} from "../../../public/rust/aheui_interpreter"
import useEditor from "./editor"

const rustAtom = atom<InitOutput | null>({
  key: "rust-atom",
  default: null,
})

const resultAtom = atom<Position>({
  key: "result-atom",
  default: undefined,
})

const processorAtom = atom<Processor | null>({
  key: "processor-atom",
  default: null,
})

export const processorPositionAtom = atom<Position>({
  key: "processor-position",
  default: {
    x: -1,
    y: -1,
    free: () => {},
  },
})

export default async function useRust() {
  const [rust, setRust] = useRecoilState(rustAtom)
  const [result, setResult] = useRecoilState(resultAtom)
  const [processor, setProcessor] = useRecoilState(processorAtom)
  const [processorPosition, setProcessorPosition] = useRecoilState(
    processorPositionAtom
  )
  const { cellList } = useEditor()

  if (!rust) {
    const initRust = await init(
      "http://localhost:3000/rust/aheui_interpreter_bg.wasm"
    )
    setRust(initRust)
  }

  function initProcessor() {
    const rsCellList = cellList
      .map((cell) => {
        const rsCell = get_cell_value(cell.position.x, cell.position.y)
        rsCell.value = cell.value || "ㅇ"
        return rsCell
      })
      .sort((a, b) => a.position.x - b.position.x)
      .sort((a, b) => a.position.y - b.position.y)
    const newProcessor = run_new(rsCellList, 3, 3)
    setProcessor(newProcessor)
  }

  function startAll() {
    initProcessor()
    if (!processor) return
    while (!processor.isEnd) {
      processor.run_one()
    }
    console.log(processor)
    console.log(processor.get_result)
  }

  function startOne() {
    if (!processor) {
      initProcessor()
    }
    if (processor) {
      processor.run_one()
      setProcessorPosition(processor.current_position)
    }
  }

  return {
    startOne,
    startAll,
    result,
  }
}
