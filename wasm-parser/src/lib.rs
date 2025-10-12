use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};

// JavaScript 콘솔에 로그 출력을 위한 매크로
macro_rules! console_log {
    ($($t:tt)*) => (web_sys::console::log_1(&format_args!($($t)*).to_string().into()))
}

// TypeScript 타입 정의를 위한 extern 선언
#[wasm_bindgen(typescript_custom_section)]
const TS_APPEND_CONTENT: &'static str = r#"
export interface ParseResult {
  success: boolean;
  binary?: number[];
  error?: string;
}

export interface ValidateResult {
  valid: boolean;
  error?: string;
}

export interface ModuleInfo {
  success: boolean;
  functions?: string[];
  exports?: string[];
  imports?: string[];
  error?: string;
}
"#;

#[derive(Serialize, Deserialize)]
pub struct ParseResult {
    pub success: bool,
    pub binary: Option<Vec<u8>>,
    pub error: Option<String>,
}

#[derive(Serialize, Deserialize)]
pub struct ValidateResult {
    pub valid: bool,
    pub error: Option<String>,
}

/// WAT 텍스트를 WASM 바이너리로 변환
#[wasm_bindgen(typescript_type = "ParseResult")]
pub fn parse_wat(input: &str) -> JsValue {
    console_log!("Parsing WAT input of length: {}", input.len());
    
    let result = match wat::parse_str(input) {
        Ok(binary) => ParseResult {
            success: true,
            binary: Some(binary),
            error: None,
        },
        Err(e) => ParseResult {
            success: false,
            binary: None,
            error: Some(e.to_string()),
        },
    };
    
    serde_wasm_bindgen::to_value(&result).unwrap()
}

/// WASM 바이너리의 유효성 검사
#[wasm_bindgen(typescript_type = "ValidateResult")]
pub fn validate_wasm(binary: &[u8]) -> JsValue {
    console_log!("Validating WASM binary of length: {}", binary.len());
    
    let result = match wasmparser::validate(binary) {
        Ok(_) => ValidateResult {
            valid: true,
            error: None,
        },
        Err(e) => ValidateResult {
            valid: false,
            error: Some(e.to_string()),
        },
    };
    
    serde_wasm_bindgen::to_value(&result).unwrap()
}

/// WAT 파싱과 검증을 한번에 수행
#[wasm_bindgen(typescript_type = "ParseResult")]
pub fn parse_and_validate_wat(input: &str) -> JsValue {
    console_log!("Parsing and validating WAT input of length: {}", input.len());
    
    let parse_result = match wat::parse_str(input) {
        Ok(binary) => {
            // 파싱 성공 시 검증도 수행
            match wasmparser::validate(&binary) {
                Ok(_) => ParseResult {
                    success: true,
                    binary: Some(binary),
                    error: None,
                },
                Err(e) => ParseResult {
                    success: false,
                    binary: None,
                    error: Some(format!("Validation failed: {}", e)),
                },
            }
        },
        Err(e) => ParseResult {
            success: false,
            binary: None,
            error: Some(format!("Parse failed: {}", e)),
        },
    };
    
    serde_wasm_bindgen::to_value(&parse_result).unwrap()
}

/// 간단한 WAT 예제 생성
#[wasm_bindgen]
pub fn get_sample_wat() -> String {
    r#"(module
  (func $add (param $lhs i32) (param $rhs i32) (result i32)
    local.get $lhs
    local.get $rhs
    i32.add)
  (export "add" (func $add))
)"#.to_string()
}

/// WASM 바이너리에서 기본 정보 추출
#[wasm_bindgen(typescript_type = "ModuleInfo")]
pub fn get_module_info(binary: &[u8]) -> JsValue {
    #[derive(Serialize, Deserialize)]
    struct ModuleInfo {
        success: bool,
        functions: Option<Vec<String>>,
        exports: Option<Vec<String>>,
        imports: Option<Vec<String>>,
        error: Option<String>,
    }
    
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
            
            ModuleInfo {
                success: true,
                functions: Some(functions),
                exports: Some(exports),
                imports: Some(imports),
                error: None,
            }
        }
        Err(e) => ModuleInfo {
            success: false,
            functions: None,
            exports: None,
            imports: None,
            error: Some(e.to_string()),
        },
    };
    
    serde_wasm_bindgen::to_value(&result).unwrap()
}