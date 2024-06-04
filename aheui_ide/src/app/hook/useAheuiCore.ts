import { atom, useRecoilState, useSetRecoilState } from "recoil"
import init, {
  InitOutput,
  run_new,
  get_cell_value,
  Position,
  Processor,
} from "../../../public/rust/aheui_interpreter"
import useEditor from "./useEditor"

const rustAtom = atom<InitOutput | null>({
  key: "rust-atom",
  default: null,
})

const outputContentAtom = atom<String[]>({
  key: "result-atom",
  default: [],
})

const processorAtom = atom<Processor | null>({
  key: "processor-atom",
  default: null,
})

const processorPositionAtom = atom<Position>({
  key: "processor-position",
  default: {
    x: -1,
    y: -1,
    free: () => {},
  },
})

const processingTimeAtom = atom<number | null>({
  key: "processing-time",
  default: null,
})

const runningCountAtom = atom<number | null>({
  key: "running-count",
  default: null,
})

export default function useAheuiCore() {
  const [rust, setRust] = useRecoilState(rustAtom)
  const [outputContent, setOutputContent] = useRecoilState(outputContentAtom)
  const [processor, setProcessor] = useRecoilState(processorAtom)
  const [processorPosition, setProcessorPosition] = useRecoilState(
    processorPositionAtom
  )
  const [processingTime, setProcessingTime] = useRecoilState(processingTimeAtom)
  const [runningCount, setRunningCount] = useRecoilState(runningCountAtom)
  const { cellList } = useEditor()

  //Todo: 여러번 호출되는 문제가 있음
  if (!rust) {
    init("/rust/aheui_interpreter_bg.wasm")
      .then((initRust) => {
        setRust(initRust)
      })
      .catch(() => {
        alert("aheui-core 로딩 실패")
      })
  }

  function initProcessor() {
    if (!rust) {
      alert("aheui-core가 아직 로딩되지 않았습니다.")
      return
    }
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
    setOutputContent([])
    return newProcessor
  }

  function startAll() {
    const newProcessor = initProcessor()
    if (!newProcessor) return
    const startTime = window.performance.now()
    let cmdCount = 0
    while (!newProcessor.is_end) {
      newProcessor.run_one()
      cmdCount++
      setProcessorPosition(newProcessor.next_position)
    }
    const endTime = window.performance.now()
    setProcessingTime(endTime - startTime)
    setRunningCount(cmdCount)
    setOutputContent(newProcessor.get_result)
  }

  function startOne() {
    if (!processor) {
      initProcessor()
      return
    }
    if (processor) {
      processor.run_one()
      setProcessorPosition(processor.next_position)
      setOutputContent(processor.get_result)
      if (processor.is_end) {
        setProcessor(null)
      }
    }
  }

  return {
    startOne,
    startAll,
    processingTime,
    processorPosition,
    runningCount,
    outputContent,
    initProcessor,
  }
}
