use wasm_bindgen::prelude::*;

use crate::Command;

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct CellValue {
    pub position: Position,
    pub value: char,
    #[wasm_bindgen(skip)]
    pub cash_cmd: Option<Command>,
}

#[wasm_bindgen]
#[derive(Clone, Copy)]
pub struct Position {
    pub x: usize,
    pub y: usize,
}
