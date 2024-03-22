import init, { run_cmd } from "../public/rust/aheui_interpreter"

export default async function useRust() {
  await init("http://localhost:3000/rust/aheui_interpreter_bg.wasm")

  return {
    run_cmd,
  }
}
