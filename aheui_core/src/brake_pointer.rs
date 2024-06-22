use wasm_bindgen::prelude::wasm_bindgen;

use crate::cell::Position;

#[wasm_bindgen]
pub struct BrakePointer {
    pub position: Position,
}
