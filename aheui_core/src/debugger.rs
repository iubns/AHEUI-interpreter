use wasm_bindgen::prelude::wasm_bindgen;

use crate::{ break_pointer::BreakPointer, cell::Position };

#[wasm_bindgen]
pub struct Debugger {
    break_point_list: Vec<BreakPointer>,
}

#[wasm_bindgen]
impl Debugger {
    pub fn new() -> Debugger {
        Debugger {
            break_point_list: vec![],
        }
    }

    pub fn has_break_pinter_at(&self, position: Position) -> bool {
        let found_bp = self.break_point_list
            .iter()
            .find(|bp| bp.position.x == position.x && bp.position.y == position.y);
        match found_bp {
            Some(_) => true,
            None => false,
        }
    }

    pub fn set_break_pointer(&mut self, x: usize, y: usize) {
        let break_pointer = BreakPointer {
            position: Position {
                x,
                y,
            },
        };
        self.break_point_list.push(break_pointer)
    }
}
