import { useEffect, useRef, useState } from "react"
import useAheuiCore from "../hook/useAheuiCore"

export default function StatusBar() {
  const tipIndexRef = useRef(0)
  const [tipIndex, setTipIndex] = useState(0)
  const { runningCount, processingTime } = useAheuiCore()

  const tips = [
    "방향키로 이동 할 수 있습니다.",
    "입력 탭을 클릭하여 값을 미리 넣을 수 있습니다.",
    "입력 탭의 빨간 칸은 앞으로 들어갈 값 입니다.",
    "숫자를 요청시 글자가 들어갈 경우 재요청 합니다.",
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
