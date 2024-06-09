use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct CellValue {
    pub position: Position,
    pub value: char,
}

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct Position {
    pub x: usize,
    pub y: usize,
}