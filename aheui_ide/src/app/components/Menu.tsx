import { useState } from "react"

enum MenuType {
  file,
  storage,
}

export default function Menu() {
  const [selectedMenu, setSelectedMenu] = useState<MenuType | null>(null)

  function FunctionArea() {
    switch (selectedMenu) {
      case MenuType.file:
        return <>파일</>
      case MenuType.storage:
        return <>저장공간</>
    }
    return <></>
  }

  return (
    <div className="h-full flex flex-row border" style={{ color: "white" }}>
      <div>
        {Object.entries(MenuType).map(([key, value]) => {
          if (typeof value === "string") return null
          return (
            <div key={key} onClick={() => setSelectedMenu(value)}>
              {key}
            </div>
          )
        })}
      </div>
      <div>{FunctionArea()}</div>
    </div>
  )
}
