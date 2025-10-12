#!/bin/bash
set -e

echo "🦀 Building WASM WAT Parser with proper TypeScript types..."

# 1. WASM으로 빌드
echo "📦 Building for web target..."
wasm-pack build --target web --out-dir ../aheui_ide/public/wasm-parser

# 2. TypeScript 정의 파일의 any 타입을 구체적인 타입으로 수정
echo "🔧 Fixing TypeScript definitions..."

# wasm_parser.d.ts 파일에서 any를 적절한 타입으로 교체
sed -i 's/export function parse_wat(input: string): any;/export function parse_wat(input: string): ParseResult;/' ../aheui_ide/public/wasm-parser/wasm_parser.d.ts
sed -i 's/export function validate_wasm(binary: Uint8Array): any;/export function validate_wasm(binary: Uint8Array): ValidateResult;/' ../aheui_ide/public/wasm-parser/wasm_parser.d.ts
sed -i 's/export function parse_and_validate_wat(input: string): any;/export function parse_and_validate_wat(input: string): ParseResult;/' ../aheui_ide/public/wasm-parser/wasm_parser.d.ts
sed -i 's/export function get_module_info(binary: Uint8Array): any;/export function get_module_info(binary: Uint8Array): ModuleInfo;/' ../aheui_ide/public/wasm-parser/wasm_parser.d.ts

echo "✅ TypeScript definitions fixed!"
echo ""
echo "📝 Updated type definitions:"
echo "  - parse_wat(input: string): ParseResult"
echo "  - validate_wasm(binary: Uint8Array): ValidateResult"
echo "  - parse_and_validate_wat(input: string): ParseResult"  
echo "  - get_module_info(binary: Uint8Array): ModuleInfo"
