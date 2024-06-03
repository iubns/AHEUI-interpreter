import { useEffect, useRef, useState } from "react"
import { useRecoilValue } from "recoil"
import { processingTime, runningCount } from "../hook/rust"

export default function StatusBar() {
  const tipIndexRef = useRef(0)
  const [tipIndex, setTipIndex] = useState(0)
  const processingTimeValue = useRecoilValue(processingTime)
  const runningCountValue = useRecoilValue(runningCount)

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
      {processingTimeValue && (
        <div>
          {" "}
          {processingTimeValue.toFixed(2)}ms ({runningCountValue} cmd){" "}
        </div>
      )}
      <div className="text-right">{tips[tipIndex]}</div>
    </div>
  )
}
