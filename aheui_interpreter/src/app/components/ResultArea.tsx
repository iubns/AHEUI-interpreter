import { useRecoilValue } from "recoil"
import { resultAtom } from "../hook/rust"

export default function ResultArea() {
  const result = useRecoilValue(resultAtom)
  return (
    <div className="h-0 flex flex-col flex-grow">
      <div className="h-full overflow-auto">
        <pre className="text-white">{result.join("")}</pre>
      </div>
    </div>
  )
}
