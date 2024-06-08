import { ChangeEvent, MouseEvent, useEffect, useRef, useState } from "react"
import { atom, useRecoilState } from "recoil"
import useAheuiCore from "../hook/useAheuiCore"

const inputListAtom = atom<string[]>({
  key: "input-list",
  default: [],
})

export default function Input() {
  const [inputList, setInputList] = useRecoilState(inputListAtom)
  const [focusIndex, setFocusIndex] = useState(0)
  const [inputValue, setInputValue] = useState("")
  const hiddenInputListRef = useRef<HTMLInputElement>(null)
  const { addInitProcessorHook } = useAheuiCore()

  const inputDataListRef = useRef<string[]>([])
  const inputDataOutIndex = useRef(0)

  function getInputData(type: "number" | "char") {
    let message =
      type === "number" ? "숫자를 입력해주세요." : "한 글자를 입력해 주세요."
    const currentData = inputDataListRef.current[inputDataOutIndex.current]
    console.log(currentData)
    if (!currentData) {
      return prompt(message)
    }
    if (type === "char") {
      inputDataOutIndex.current++
      return currentData
    }
    const data = Number.parseInt(currentData)
    if (Number.isNaN(data)) {
      return prompt(message)
    }
    inputDataOutIndex.current++
    return data.toString()
  }

  useEffect(() => {
    //@ts-ignore
    if (!window.getInputData) {
      //@ts-ignore
      window.getInputData = getInputData
      addInitProcessorHook(() => {
        inputDataOutIndex.current = 0
      })
    }
  }, [])

  useEffect(() => {
    inputDataListRef.current = inputList
  }, [inputList])

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
