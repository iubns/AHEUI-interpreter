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
    [Symbol.dispose]: () => {},
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

const aheuiWatAtom = atom<string>({
  key: "wasm-atom",
  default: '',
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
  const [aheuiWat, setAheuiWat] = useRecoilState(aheuiWatAtom)
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
    console.log("cellList", cellList) 
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
    console.log(maxColSize, maxRowSize)
    const newProcessor = run_new(rsCellList, maxColSize, maxRowSize)
    setProcessor(newProcessor)
    setNextProcessingPosition(newProcessor.current_position)
    setOutputContent([])
    setStorage(new Array(28).fill(""))
    initProcessorHooks.forEach((hook) => hook())
    return newProcessor
  }

  async function startAll() {
    let currentProcessor = processor ? processor : initProcessor()
    if (!currentProcessor) return
    const startTime = window.performance.now()

    function mainLoop(currentProcessor: Processor, cycleCount: number) {
      currentProcessor.run_one_cycle(cycleCount)

      const endTime = window.performance.now()
      setProcessingTime(endTime - startTime)
      setRunningCount(currentProcessor.cmd_processing_count)
      setOutputContent(currentProcessor.get_result)
      setNextProcessingPosition(currentProcessor.next_position)

      if (!currentProcessor.is_end) {
        setTimeout(() => mainLoop(currentProcessor, cycleCount + 1), 1)
        return
      }
      getStorageDataFromProcessor(currentProcessor)
      setProcessor(null)
      endProcessorHooks.forEach((hook) => hook())
    }
    mainLoop(currentProcessor, 0)
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

  async function startWithDebug() {
    const debugging: Debugger = Debugger.new()
    brakePointerList.map((BP) => {
      debugging.set_break_pointer(BP.position.x, BP.position.y)
    })

    let currentProcessor = !processor ? initProcessor() : processor
    if (!currentProcessor) return

    const startTime = window.performance.now()

    function mainLoop(currentProcessor: Processor, cycleCount: number) {
      if (!currentProcessor) return
      const isBreak = currentProcessor.run_with_debug(cycleCount, debugging)

      const endTime = window.performance.now()
      setProcessingTime(endTime - startTime)
      setRunningCount(currentProcessor.cmd_processing_count)
      setOutputContent(currentProcessor.get_result)
      setNextProcessingPosition(currentProcessor.next_position)

      if (!currentProcessor.is_end && !isBreak) {
        setTimeout(() => mainLoop(currentProcessor, cycleCount + 1), 1)
        return
      }
      getStorageDataFromProcessor(currentProcessor)

      if (currentProcessor.is_end) {
        setProcessor(null)
      }
      endProcessorHooks.forEach((hook) => hook())
    }
    mainLoop(currentProcessor, 0)
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

  async function wasmBuldAndRun() {
    if (!aheuiCore) {
      console.error("aheui-core가 아직 로딩되지 않았습니다.")
      return
    }

    const process = initProcessor()
    if (!process) return
    setAheuiWat(process.compile_aheui_to_wat())
    let result = await process.compile_to_wasm()
    if (!result) return
    if(!result.binary){
      throw new Error(result.error)
    }

    const wasmBytes = new Uint8Array(result.binary)
    const compiledWasm = await WebAssembly.compile(wasmBytes)
    const instance = await WebAssembly.instantiate(compiledWasm, {}) as WebAssembly.Instance & 
    {
      exports: {
        run: () => number
        memory?: WebAssembly.Memory
      }
    }

    const { run, memory } = instance.exports
    const startTime = window.performance.now()
    run()
    const endTime = window.performance.now()
    setProcessingTime(endTime - startTime)

    if (memory instanceof WebAssembly.Memory) {
      const buffer = new Uint8Array(memory.buffer)
      const decoder = new TextDecoder("utf-8")
      const str = decoder.decode(buffer)
      setOutputContent([str])
    } else {
      setOutputContent([])
      console.warn("WASM instance has no exported memory")
    }

    return instance.exports
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
    wasmBuldAndRun,
    aheuiWat
  }
}
