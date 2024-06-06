import { atom, useRecoilState } from "recoil"
import init, {
  InitOutput,
  run_new,
  get_cell_value,
  Position,
  Processor,
} from "../../../public/aheui-core-wasm/aheui_interpreter"
import useEditor from "./useEditor"
import { useRef } from "react"

const outputContentAtom = atom<String[]>({
  key: "result-atom",
  default: [],
})

const processorAtom = atom<Processor | null>({
  key: "processor-atom",
  default: null,
})

const nextProcessingPositionAtom = atom<Position>({
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
  const aheuiCore = useRef<InitOutput | null | undefined>(undefined)
  const [outputContent, setOutputContent] = useRecoilState(outputContentAtom)
  const [processor, setProcessor] = useRecoilState(processorAtom)
  const [nextProcessingPosition, setNextProcessingPosition] = useRecoilState(
    nextProcessingPositionAtom
  )
  const [processingTime, setProcessingTime] = useRecoilState(processingTimeAtom)
  const [runningCount, setRunningCount] = useRecoilState(runningCountAtom)
  const { cellList } = useEditor()

  //Todo: 여러번 호출되는 문제가 있음
  if (aheuiCore.current === undefined) {
    aheuiCore.current = null
    const aheuiCoreWasmURL =
      process.env.NODE_ENV === "development"
        ? "/aheui-core-wasm/aheui_interpreter_bg.wasm"
        : "/AHEUI-interpreter/aheui-core-wasm/aheui_interpreter_bg.wasm"
    init(aheuiCoreWasmURL)
      .then((initRust) => {
        aheuiCore.current = initRust
      })
      .catch(() => {
        console.error("aheui-core 로딩 실패")
      })
  }

  function initProcessor() {
    if (!aheuiCore.current) {
      console.error("aheui-core가 아직 로딩되지 않았습니다.")
      return
    }
    let maxRowSize = 0
    let maxColSize = 0
    const rsCellList = cellList
      .map((cell) => {
        const rsCell = get_cell_value(cell.position.x, cell.position.y)
        //Todo: 사실 없을 일이 없을거 같음, 확실히 확인후 ts nullable제거
        rsCell.value = cell.value || "ㅎ"
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
    setNextProcessingPosition(newProcessor.current_position)
    setOutputContent([])
    return newProcessor
  }

  async function startAll() {
    const newProcessor = initProcessor()
    if (!newProcessor) return
    const startTime = window.performance.now()
    let cmdCount = 0

    function mainLoop(newProcessor: Processor) {
      if (!newProcessor) return
      do {
        newProcessor.run_one()
        cmdCount++
      } while (!newProcessor.is_end && cmdCount % 10_000_000 !== 0)

      setRunningCount(cmdCount)
      const endTime = window.performance.now()
      setProcessingTime(endTime - startTime)
      setOutputContent(newProcessor.get_result)
      setNextProcessingPosition(newProcessor.current_position)

      if (!newProcessor.is_end) {
        setTimeout(() => mainLoop(newProcessor), 0)
        return
      } else {
        setOutputContent(newProcessor.get_result)
      }
    }
    mainLoop(newProcessor)
  }

  function startOne() {
    if (!processor) {
      initProcessor()
      return
    }
    if (processor) {
      processor.run_one()
      setNextProcessingPosition(processor.next_position)
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
    nextProcessingPosition,
    runningCount,
    outputContent,
    initProcessor,
  }
}
