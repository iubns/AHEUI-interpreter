import { useEffect, useRef, useState } from "react"
import useAheuiCore from "../hook/useAheuiCore"
import { isNull } from "lodash"

export default function StatusBar() {
  const tipIndexRef = useRef(0)
  const [tipIndex, setTipIndex] = useState(0)
  const { runningCount, processingTime } = useAheuiCore()

  const tips = [
    "방향키로 이동 할 수 있습니다.",
    "입력 탭을 클릭하여 값을 미리 넣을 수 있습니다.",
    "입력 탭의 빨간 칸은 앞으로 들어갈 값 입니다.",
    "숫자를 요청시 글자가 들어갈 경우 재요청 합니다.",
    "더블 클릭으로 브레이크 포인트를 추가 할 수 있습니다.",
    "F10으로 한단계 실행을 할 수 있습니다.",
    "F5로 디버깅 모드로 실행 할 수 있습니다.",
    "F9로 브레이크 포인트를 추가 및 삭제 할 수 있습니다.",
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
        {!isNull(processingTime) && (
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
