import { atom, useRecoilState } from "recoil"
import init, {
  InitOutput,
  run_new,
  get_cell_value,
  Position,
  Processor,
  Debugger,
} from "../../../public/aheui-core-wasm/aheui_interpreter"
import useEditor from "./useEditor"

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
    x: 0,
    y: -1,
    free: () => {},
  },
})

const processingTimeAtom = atom<number | null>({
  key: "processing-time",
  default: null,
})

const runningCountAtom = atom<bigint | null>({
  key: "running-count",
  default: null,
})

const initProcessorHooksAtom = atom<(() => void)[]>({
  key: "init-processor-hooks",
  default: [],
})

const mediumProcessorHooksAtom = atom<(() => void)[]>({
  key: "medium-processor-hooks",
  default: [],
})

const endProcessorHooksAtom = atom<(() => void)[]>({
  key: "end-processor-hooks",
  default: [],
})

const storageAtom = atom<Array<BigInt64Array>>({
  key: "storage",
  default: [],
})

let aheuiCore: undefined | null | InitOutput = undefined

export default function useAheuiCore() {
  const [outputContent, setOutputContent] = useRecoilState(outputContentAtom)
  const [processor, setProcessor] = useRecoilState(processorAtom)
  const [nextProcessingPosition, setNextProcessingPosition] = useRecoilState(
    nextProcessingPositionAtom
  )
  const [processingTime, setProcessingTime] = useRecoilState(processingTimeAtom)
  const [runningCount, setRunningCount] = useRecoilState(runningCountAtom)
  const [storageList, setStorage] = useRecoilState(storageAtom)
  const { cellList, brakePointerList } = useEditor()

  const [initProcessorHooks, setInitProcessorHooks] = useRecoilState(
    initProcessorHooksAtom
  )

  const [mediumProcessorHooks, setMediumProcessorHooks] = useRecoilState(
    mediumProcessorHooksAtom
  )

  const [endProcessorHooks, setEndProcessorHooks] = useRecoilState(
    endProcessorHooksAtom
  )

  if (aheuiCore === undefined) {
    aheuiCore = null
    const aheuiCoreWasmURL =
      process.env.NODE_ENV === "development"
        ? "/aheui-core-wasm/aheui_interpreter_bg.wasm"
        : "/AHEUI-interpreter/aheui-core-wasm/aheui_interpreter_bg.wasm"
    init(aheuiCoreWasmURL)
      .then((initRust) => {
        aheuiCore = initRust
      })
      .catch(() => {
        console.log("아희 코어 로딩 실패")
      })
  }

  function initProcessor() {
    if (!aheuiCore) {
      console.error("aheui-core가 아직 로딩되지 않았습니다.")
      return
    }
    let maxRowSize = 0
    let maxColSize = 0
    const rsCellList = cellList.map((cell) => {
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
    const newProcessor = run_new(rsCellList, maxColSize, maxRowSize)
    setProcessor(newProcessor)
    setNextProcessingPosition(newProcessor.current_position)
    setOutputContent([])
    setStorage(new Array(28).fill(""))
    initProcessorHooks.forEach((hook) => hook())
    return newProcessor
  }

  async function startAll() {
    const newProcessor = initProcessor()
    if (!newProcessor) return
    const startTime = window.performance.now()

    function mainLoop(newProcessor: Processor, cycleCount: number) {
      if (!newProcessor) return
      newProcessor.run_one_cycle(cycleCount)

      const endTime = window.performance.now()
      setProcessingTime(endTime - startTime)
      setRunningCount(newProcessor.cmd_processing_count)
      setOutputContent(newProcessor.get_result)
      setNextProcessingPosition(newProcessor.current_position)

      if (!newProcessor.is_end) {
        setTimeout(() => mainLoop(newProcessor, cycleCount + 1), 1)
        return
      }
      getStorageDataFromProcessor(newProcessor)
      endProcessorHooks.forEach((hook) => hook())
    }
    mainLoop(newProcessor, 0)
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
      setRunningCount(processor.cmd_processing_count)
      getStorageDataFromProcessor(processor)
      if (processor.is_end) {
        initProcessorHooks.forEach((hook) => hook())
        setProcessor(null)
      }
      mediumProcessorHooks.forEach((hook) => hook())
    }
  }

  function startWithDebug() {
    const debugging: Debugger = Debugger.new()
    brakePointerList.map((BP) => {
      debugging.set_brake_pointer(BP.position.x, BP.position.y)
    })

    let currentProcessor = !processor ? initProcessor() : processor
    if (!currentProcessor) return
    currentProcessor.run_with_debug(debugging)

    setNextProcessingPosition(currentProcessor.next_position)
    setOutputContent(currentProcessor.get_result)
    getStorageDataFromProcessor(currentProcessor)
    setRunningCount(currentProcessor.cmd_processing_count)
  }

  function getStorageDataFromProcessor(processor: Processor) {
    let tempStorage: Array<BigInt64Array> = []
    for (let index = 0; index <= 27; index++) {
      processor.selected_storage_for_js = index
      tempStorage.push(processor.get_storage)
    }
    setStorage(tempStorage)
  }

  function addInitProcessorHook(newHook: () => void) {
    setInitProcessorHooks([...initProcessorHooks, newHook])
  }

  function addMediumProcessorHook(newHook: () => void) {
    setMediumProcessorHooks([...mediumProcessorHooks, newHook])
  }

  function addEndProcessorHook(newHook: () => void) {
    setEndProcessorHooks([...endProcessorHooks, newHook])
  }

  return {
    startOne,
    startAll,
    startWithDebug,
    processingTime,
    nextProcessingPosition,
    runningCount,
    outputContent,
    storageList,
    initProcessor,
    addInitProcessorHook,
    addMediumProcessorHook,
    addEndProcessorHook,
  }
}
