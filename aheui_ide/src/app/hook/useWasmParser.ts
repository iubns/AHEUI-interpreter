import { useEffect } from "react"
import init, {
    parse_wat,
    parse_and_validate_wat,
    validate_wasm,
} from "../../../public/wasm-parser/wasm_parser"

export default function useWatRunner() {
    useEffect(() => {
        initWasmParser()
    })


    async function initWasmParser() {
        await init()
    }

    async function parseWat(input: string) {
        const result = parse_wat(input)
        return result
    }

    async function validateWasm(binary: Uint8Array) {
        const result = validate_wasm(binary)
        return result
    }

    async function parseAndValidateWat(input: string) {
        const result = parse_and_validate_wat(input)
        return result
    }

    async function runWat(input: string) {
        const parsed = await parseAndValidateWat(input)
        if(!parsed.binary){
            throw new Error(parsed.error)
        }
        const validated = await validateWasm(new Uint8Array(parsed.binary))

        const wasmBytes = new Uint8Array(parsed.binary)
        const compiledWasm = await WebAssembly.compile(wasmBytes)
        const instance = await WebAssembly.instantiate(compiledWasm, {})

        return instance.exports
    }

    return {
        runWat
    }
}   