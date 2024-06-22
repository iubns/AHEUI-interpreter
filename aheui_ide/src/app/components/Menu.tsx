import { useState } from "react"
import example from "../lib/example"
import useEditor from "../hook/useEditor"

enum MenuType {
  파일,
  예제,
}

function getIcon(menuType: MenuType) {
  switch (menuType) {
    case MenuType.파일:
      return "file"
    case MenuType.예제:
      return "example"
  }
}

export default function Menu() {
  const baseDomain =
    process.env.NODE_ENV === "production" ? "/AHEUI-interpreter" : ""
  const [selectedMenu, setSelectedMenu] = useState<MenuType | null>(null)

  function FunctionArea() {
    switch (selectedMenu) {
      case MenuType.파일:
        return <div className="p-2">파일 기능 준비중</div>
      case MenuType.예제:
        return <ExampleList />
    }
    return <></>
  }

  function onClickMenu(menuType: MenuType) {
    if (menuType === selectedMenu) {
      setSelectedMenu(null)
      return
    }
    setSelectedMenu(menuType)
  }

  return (
    <div className="h-full flex flex-row border" style={{ color: "white" }}>
      <div style={{ backgroundColor: "#2C2C2C" }}>
        {Object.entries(MenuType).map(([key, value]) => {
          if (typeof value === "string") return null
          return (
            <div
              key={key}
              className="m-2 cursor-pointer"
              onClick={() => onClickMenu(value)}
            >
              <img
                width="35"
                src={baseDomain + "/icons/" + getIcon(value) + ".png"}
              />
            </div>
          )
        })}
      </div>
      <div>{FunctionArea()}</div>
    </div>
  )
}

function ExampleList() {
  const { bulkInsert, clearCellList } = useEditor()

  function setContentToEditor(content: string) {
    clearCellList()
    bulkInsert(content, { x: 0, y: 0 })
  }

  return (
    <div className="flex flex-col items-start p-2">
      <button onClick={() => setContentToEditor(example.helloWorld)}>
        hello world
      </button>
      <button onClick={() => setContentToEditor(example.multiplicationTables)}>
        구구단
      </button>
      <button onClick={() => setContentToEditor(example.addFrom1ToN)}>
        1부터 N까지 더하기
      </button>
      <button onClick={() => setContentToEditor(example.addFrom1ToN_Fast)}>
        1부터 N까지 더하기 (등차수열)
      </button>
      <button onClick={() => setContentToEditor(example.bottlesOfBeer)}>
        99병의 맥주
      </button>
      <button onClick={() => setContentToEditor(example.factorization)}>
        소인수 분해
      </button>
    </div>
  )
}
