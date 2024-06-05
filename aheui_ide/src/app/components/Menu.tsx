import Image from "next/image"
import { useState } from "react"

enum MenuType {
  파일,
  저장공간,
  예제,
}

function getIcon(menuType: MenuType) {
  switch (menuType) {
    case MenuType.파일:
      return "file"
    case MenuType.저장공간:
      return "storage"
    case MenuType.예제:
      return "example"
  }
}

export default function Menu() {
  const [selectedMenu, setSelectedMenu] = useState<MenuType | null>(null)

  function FunctionArea() {
    switch (selectedMenu) {
      case MenuType.파일:
        return <>파일</>
      case MenuType.저장공간:
        return <>저장공간</>
      case MenuType.예제:
        return <>저장공간</>
    }
    return <></>
  }

  return (
    <div className="h-full flex flex-row border" style={{ color: "white" }}>
      <div className="bg-slate-700">
        {Object.entries(MenuType).map(([key, value]) => {
          if (typeof value === "string") return null
          return (
            <div
              key={key}
              className="m-2"
              onClick={() => setSelectedMenu(value)}
            >
              <img width="35" src={"/icons/" + getIcon(value) + ".png"} />
            </div>
          )
        })}
      </div>
      <div>{FunctionArea()}</div>
    </div>
  )
}
