import useAheuiCore from "../hook/useAheuiCore"

export default function Controller() {
  const { startAll, startOne, initProcessor } = useAheuiCore()

  return (
    <div className="flex flex-row gap-10 z-20 justify-center items-center bg-slate-300">
      <button onClick={startOne}>한단계 실행</button>
      <button>디버깅 모드로 실행</button>
      <button onClick={startAll}>전체 실행</button>
      <button onClick={initProcessor}>초기화</button>
    </div>
  )
}
