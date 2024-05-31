import { useRecoilValue } from "recoil"
import { resultAtom } from "../hook/rust"

export default function ResultArea() {
  const result = useRecoilValue(resultAtom)
  return (
    <div className="flex flex-grow">
      {result.map((r, index) => (
        <div
          key={index}
          style={{
            color: "white",
          }}
        >
          {r.toString()}
        </div>
      ))}
    </div>
  )
}
