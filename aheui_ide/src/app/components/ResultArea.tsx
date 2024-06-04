import useAheuiCore from "../hook/useAheuiCore"

export default function ResultArea() {
  const { outputContent } = useAheuiCore()

  return (
    <div className="h-0 flex flex-col flex-grow">
      <div className="h-full overflow-auto">
        <pre className="text-white">{outputContent.join("")}</pre>
      </div>
    </div>
  )
}
