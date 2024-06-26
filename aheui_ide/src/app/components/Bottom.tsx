import { useEffect, useState } from "react"
import StatusBar from "./StatusBar"
import Output from "./Output"
import Input from "./Input"
import useAheuiCore from "../hook/useAheuiCore"
import Storage from "./Storage"

enum Tabs {
  output,
  input,
  storage,
}

export default function Bottom() {
  const { addInitProcessorHook, addMediumProcessorHook, addEndProcessorHook } =
    useAheuiCore()
  const [selectedTab, setSelectedTab] = useState(Tabs.input)

  useEffect(() => {
    addInitProcessorHook(() => {
      setSelectedTab(Tabs.input)
    })
    addEndProcessorHook(() => {
      setSelectedTab(Tabs.output)
    })
  }, [])

  function TabComponent({ tab }: { tab: Tabs }) {
    let tabName = ""
    switch (tab) {
      case Tabs.output:
        tabName = "출력"
        break
      case Tabs.input:
        tabName = "입력"
        break
      case Tabs.storage:
        tabName = "저장공간"
        break
    }

    return (
      <div
        className={`cursor-pointer text-white rounded p-1 ${
          selectedTab === tab && "bg-gray-500"
        } `}
        onClick={() => setSelectedTab(tab)}
      >
        {tabName}
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-grow">
      <div className="flex gap-2">
        <TabComponent tab={Tabs.input} />
        <TabComponent tab={Tabs.output} />
        <TabComponent tab={Tabs.storage} />
      </div>
      {selectedTab === Tabs.output && <Output />}
      {selectedTab === Tabs.input && <Input />}
      {selectedTab === Tabs.storage && <Storage />}
    </div>
  )
}
