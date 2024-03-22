"use client"

import { useEffect } from "react"
import useRust from "../../hooks/rust"

export default function Home() {
  const rust = useRust()

  useEffect(() => {
    fetch()
  }, [])

  async function fetch() {
    const { run_cmd } = await rust
    run_cmd("발망해")
  }

  return <div>hello!?</div>
}
