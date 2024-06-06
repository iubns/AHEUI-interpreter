import { useEffect, useRef, useState } from "react"
import useAheuiCore from "../hook/useAheuiCore"

export default function StatusBar() {
  const tipIndexRef = useRef(0)
  const [tipIndex, setTipIndex] = useState(0)
  const { runningCount, processingTime } = useAheuiCore()

  const tips = [
    "방향키로 이동 할 수 있습니다.",
    "F10으로 한단계 실행이 가능합니다.",
  ]

  useEffect(() => {
    const id = setInterval(tipIndexInterval, 1000 * 10)
    return () => clearInterval(id)
  }, [])

  function tipIndexInterval() {
    if (tipIndexRef.current >= tips.length - 1) {
      tipIndexRef.current = 0
    } else {
      tipIndexRef.current++
    }
    setTipIndex(tipIndexRef.current)
  }

  return (
    <div className="flex bg-gray-800 text-xs pr-4 text-white p-1 justify-between">
      <div>
        {processingTime && (
          <div>
            {processingTime.toFixed(2)}ms (
            {runningCount?.toLocaleString("ko-KR")} cmd)
          </div>
        )}
      </div>
      <div className="text-right">{tips[tipIndex]}</div>
    </div>
  )
}
