import { useState } from "react"
import example from "../lib/example"
import useEditor from "../hook/useEditor"
import FileArea from "./FileArea"

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
        return <FileArea />
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
    <div className="h-full flex flex-row " style={{ color: "white" }}>
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
      <div style={{ backgroundColor: "#2F2F2F" }}>{FunctionArea()}</div>
    </div>
  )
}

function ExampleList() {
  const { bulkInsert, clearCellList, cellList } = useEditor()

  function setContentToEditor(content: string) {
    if(cellList.length > 0){
      if(!window.confirm("현재 편집 중인 내용이 사라집니다. 계속하시겠습니까?")) {
        return
      }
    }
    clearCellList()
    bulkInsert(content, { x: 0, y: 0 })
  }

  return (
    <div className="flex flex-col items-start p-2">
      {
        example.map(({ name, content }) => (
          <button key={name} onClick={() => setContentToEditor(content)}>
            {name}
          </button>
        ))
      }
    </div>
  )
}
