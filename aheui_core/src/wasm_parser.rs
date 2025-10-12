use wasm_bindgen::prelude::*;

// JavaScript 콘솔에 로그 출력을 위한 매크로 (wasm 환경/비 wasm 환경 모두 지원)
#[cfg(target_arch = "wasm32")]
macro_rules! console_log {
    ($($t:tt)*) => (web_sys::console::log_1(&format_args!($($t)*).to_string().into()))
}
#[cfg(not(target_arch = "wasm32"))]
macro_rules! console_log {
    ($($t:tt)*) => (println!("{}", format_args!($($t)*)))
}

// 결과를 클래스로 노출하여 .d.ts에서 정확한 타입을 제공
#[wasm_bindgen]
pub struct WasmParseResult {
        success: bool,
        binary: Option<Box<[u8]>>,
        error: Option<String>,
}

#[wasm_bindgen]
impl WasmParseResult {
        #[wasm_bindgen(getter)]
        pub fn success(&self) -> bool { self.success }
        #[wasm_bindgen(getter)]
        pub fn binary(&self) -> Option<Box<[u8]>> { self.binary.clone() }
        #[wasm_bindgen(getter)]
        pub fn error(&self) -> Option<String> { self.error.clone() }
}

#[wasm_bindgen]
pub struct WasmValidateResult {
        valid: bool,
        error: Option<String>,
}

#[wasm_bindgen]
impl WasmValidateResult {
        #[wasm_bindgen(getter)]
        pub fn valid(&self) -> bool { self.valid }
        #[wasm_bindgen(getter)]
        pub fn error(&self) -> Option<String> { self.error.clone() }
}

/// WAT 텍스트를 WASM 바이너리로 변환
#[wasm_bindgen]
pub fn parse_wat(input: &str) -> WasmParseResult {
    console_log!("Parsing WAT input of length: {}", input.len());

    match wat::parse_str(input) {
        Ok(binary) => WasmParseResult { success: true, binary: Some(binary.into_boxed_slice()), error: None },
        Err(e) => WasmParseResult { success: false, binary: None, error: Some(e.to_string()) },
    }
}

/// WASM 바이너리의 유효성 검사
#[wasm_bindgen]
pub fn validate_wasm(binary: &[u8]) -> WasmValidateResult {
    console_log!("Validating WASM binary of length: {}", binary.len());

    match wasmparser::validate(binary) {
        Ok(_) => WasmValidateResult { valid: true, error: None },
        Err(e) => WasmValidateResult { valid: false, error: Some(e.to_string()) },
    }
}

/// WAT 파싱과 검증을 한번에 수행
#[wasm_bindgen]
pub fn parse_and_validate_wat(input: &str) -> WasmParseResult {
    console_log!("Parsing and validating WAT input of length: {}", input.len());

    match wat::parse_str(input) {
        Ok(binary) => match wasmparser::validate(&binary) {
            Ok(_) => WasmParseResult { success: true, binary: Some(binary.into_boxed_slice()), error: None },
            Err(e) => WasmParseResult { success: false, binary: None, error: Some(format!("Validation failed: {}", e)) },
        },
        Err(e) => WasmParseResult { success: false, binary: None, error: Some(format!("Parse failed: {}", e)) },
    }
}

/// WASM 바이너리에서 기본 정보 추출
#[wasm_bindgen]
pub struct WasmModuleInfo {
    success: bool,
    functions: Option<Box<[String]>>,
    exports: Option<Box<[String]>>,
    imports: Option<Box<[String]>>,
    error: Option<String>,
}

#[wasm_bindgen]
impl WasmModuleInfo {
    #[wasm_bindgen(getter)]
    pub fn success(&self) -> bool { self.success }
    #[wasm_bindgen(getter)]
    pub fn functions(&self) -> Option<Box<[String]>> { self.functions.clone() }
    #[wasm_bindgen(getter)]
    pub fn exports(&self) -> Option<Box<[String]>> { self.exports.clone() }
    #[wasm_bindgen(getter)]
    pub fn imports(&self) -> Option<Box<[String]>> { self.imports.clone() }
    #[wasm_bindgen(getter)]
    pub fn error(&self) -> Option<String> { self.error.clone() }
}

#[wasm_bindgen]
pub fn get_module_info(binary: &[u8]) -> WasmModuleInfo {

    let mut functions = Vec::new();
    let mut exports = Vec::new();
    let mut imports = Vec::new();

    let parser = wasmparser::Parser::new(0);

    let result = match parser.parse_all(binary).collect::<Result<Vec<_>, _>>() {
        Ok(payloads) => {
            for payload in payloads {
                match payload {
                    wasmparser::Payload::FunctionSection(reader) => {
                        for (i, _) in reader.into_iter().enumerate() {
                            functions.push(format!("func_{}", i));
                        }
                    }
                    wasmparser::Payload::ExportSection(reader) => {
                        for export in reader {
                            if let Ok(export) = export {
                                exports.push(export.name.to_string());
                            }
                        }
                    }
                    wasmparser::Payload::ImportSection(reader) => {
                        for import in reader {
                            if let Ok(import) = import {
                                imports.push(format!("{}::{}", import.module, import.name));
                            }
                        }
                    }
                    _ => {}
                }
            }
            WasmModuleInfo {
                success: true,
                functions: Some(functions.into_boxed_slice()),
                exports: Some(exports.into_boxed_slice()),
                imports: Some(imports.into_boxed_slice()),
                error: None
            }
        }
        Err(e) => WasmModuleInfo { success: false, functions: None, exports: None, imports: None, error: Some(e.to_string()) },
    };
    result
}
