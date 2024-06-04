import useAheuiCore from "../hook/useAheuiCore"

export default function Controller() {
  const { startAll, startOne, initProcessor } = useAheuiCore()

  function runCmd(type: string) {
    switch (type) {
      case "one":
        startOne()
        break
      case "all":
        startAll()
        break
      case "init":
        initProcessor()
        break
    }
  }

  return (
    <div className="flex flex-row gap-10 z-20 justify-center items-center bg-slate-300">
      <button onClick={() => runCmd("one")}>한단계 실행</button>
      <button>디버깅 모드로 실행</button>
      <button onClick={() => runCmd("all")}>전체 실행</button>
      <button onClick={() => runCmd("init")}>초기화</button>
    </div>
  )
}
