import useAheuiCore from "../hook/useAheuiCore"

export default function Output() {
  const { outputContent } = useAheuiCore()

  return (
    <div className="h-0 flex flex-grow p-1">
      <div className="h-full w-full overflow-auto">
        <pre className="text-white">{outputContent.join("")}</pre>
      </div>
    </div>
  )
}
