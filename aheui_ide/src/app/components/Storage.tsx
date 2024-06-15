import useAheuiCore from "../hook/useAheuiCore"

export default function Storage() {
  const { storageList } = useAheuiCore()
  const storageNames = [
    "아",
    "악",
    "앆",
    "앇",
    "안",
    "앉",
    "않",
    "앋",
    "알",
    "앍",
    "앎",
    "앏",
    "앐",
    "앑",
    "앒",
    "앓",
    "암",
    "압",
    "앖",
    "앗",
    "았",
    "앙",
    "앚",
    "앛",
    "앜",
    "앝",
    "앞",
    "앟",
  ]

  return (
    <div className="h-0 flex flex-grow p-1">
      <div className="h-full w-full overflow-auto flex flex-col text-white p-1">
        {storageList.map((storage, index) => {
          return (
            <div className=" border-slate-900" key={index}>
              {storageNames[index]}: {storage.toString()}
            </div>
          )
        })}
      </div>
    </div>
  )
}
