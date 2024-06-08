import { ChangeEvent, MouseEvent, useRef, useState } from "react"
import { atom, useRecoilState } from "recoil"

const inputListAtom = atom<string[]>({
  key: "input-list",
  default: [],
})

export default function Input() {
  const [inputList, setInputList] = useRecoilState(inputListAtom)
  const [focusIndex, setFocusIndex] = useState(0)
  const [inputValue, setInputValue] = useState("")
  const hiddenInputListRef = useRef<HTMLInputElement>(null)

  function createNewInputData() {
    setFocusIndex(inputList.length)
    setInputValue("")
    hiddenInputListRef.current?.focus()
  }

  function onChangeInputData(e: ChangeEvent<HTMLInputElement>) {
    setInputValue(e.target.value)
    const newList = [...inputList]
    newList[focusIndex] = e.target.value
    setInputList(newList.filter((data) => data))
  }

  function editInputData(
    e: MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
    index: number
  ) {
    setFocusIndex(index)
    setInputValue(inputList[index])
    hiddenInputListRef.current?.focus()
    e.stopPropagation()
  }

  return (
    <div className="h-0 flex flex-grow p-1">
      <div
        className="overflow-auto w-full flex-row flex gap-2 flex-wrap"
        onClick={createNewInputData}
      >
        <input
          ref={hiddenInputListRef}
          className="h-0 absolute"
          value={inputValue}
          onChange={onChangeInputData}
        />
        {inputList.map((inputData, index) => (
          <div
            className="rounded text-white border border-gray-800 flex h-8 items-center p-1"
            onClick={(e) => editInputData(e, index)}
            key={index}
          >
            {inputData}
          </div>
        ))}
      </div>
    </div>
  )
}
