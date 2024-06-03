import { atom, useRecoilState, useSetRecoilState } from "recoil"
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

export const resultAtom = atom<String[]>({
  key: "result-atom",
  default: [],
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

export const processingTime = atom<number | null>({
  key: "processing-time",
  default: null,
})

export const runningCount = atom<number | null>({
  key: "running-count",
  default: null,
})

export default async function useAheuiCore() {
  const [rust, setRust] = useRecoilState(rustAtom)
  const [result, setResult] = useRecoilState(resultAtom)
  const [processor, setProcessor] = useRecoilState(processorAtom)
  const [processorPosition, setProcessorPosition] = useRecoilState(
    processorPositionAtom
  )
  const setProcessingTime = useSetRecoilState(processingTime)
  const setRunningCount = useSetRecoilState(runningCount)
  const { cellList } = useEditor()

  if (!rust) {
    const initRust = await init("/rust/aheui_interpreter_bg.wasm")
    setRust(initRust)
  }

  function initProcessor() {
    let maxRowSize = 0
    let maxColSize = 0
    const rsCellList = cellList
      .map((cell) => {
        const rsCell = get_cell_value(cell.position.x, cell.position.y)
        rsCell.value = cell.value || "ㅇ"
        if (maxRowSize < cell.position.y) {
          maxRowSize = cell.position.y
        }
        if (maxColSize < cell.position.x) {
          maxColSize = cell.position.x
        }
        return rsCell
      })
      .sort((a, b) => a.position.x - b.position.x)
      .sort((a, b) => a.position.y - b.position.y)
    const newProcessor = run_new(rsCellList, maxColSize, maxRowSize)
    setProcessor(newProcessor)
    setProcessorPosition(newProcessor.current_position)
    setResult([])
    return newProcessor
  }

  function startAll() {
    const newProcessor = initProcessor()
    const startTime = window.performance.now()
    let cmdCount = 0
    while (!newProcessor.isEnd) {
      newProcessor.run_one()
      cmdCount++
      setProcessorPosition(newProcessor.next_position)
    }
    const endTime = window.performance.now()
    setProcessingTime(endTime - startTime)
    setRunningCount(cmdCount)
    setResult(newProcessor.get_result)
  }

  function startOne() {
    if (!processor) {
      initProcessor()
      return
    }
    if (processor) {
      processor.run_one()
      setProcessorPosition(processor.next_position)
      setResult(processor.get_result)
      if (processor.isEnd) {
        setProcessor(null)
      }
    }
  }

  return {
    startOne,
    startAll,
    result,
    initProcessor,
  }
}
