#!/bin/bash
set -e

echo "🦀 Building WASM WAT Parser..."

# wasm-pack이 설치되어 있는지 확인
if ! command -v wasm-pack &> /dev/null; then
    echo "wasm-pack을 설치합니다..."
    curl https://rustwasm.github.io/wasm-pack/installer/init.sh -sSf | sh
fi

# WASM으로 빌드
echo "📦 Building for web target..."
wasm-pack build --target web --out-dir pkg

# 빌드 완료
echo "✅ Build complete!"
