use wasm_bindgen::prelude::wasm_bindgen;

use crate::{ brake_pointer::{ BrakePointer }, cell::Position };

#[wasm_bindgen]
pub struct Debugger {
    brake_point_list: Vec<BrakePointer>,
}

#[wasm_bindgen]
impl Debugger {
    pub fn new() -> Debugger {
        Debugger {
            brake_point_list: vec![],
        }
    }

    pub fn has_brake_pinter_at(&self, position: Position) -> bool {
        let found_bp = self.brake_point_list
            .iter()
            .find(|bp| bp.position.x == position.x && bp.position.y == position.y);
        match found_bp {
            Some(_) => true,
            None => false,
        }
    }

    pub fn set_brake_pointer(&mut self, x: usize, y: usize) {
        let brake_pointer = BrakePointer {
            position: Position {
                x,
                y,
            },
        };
        self.brake_point_list.push(brake_pointer)
    }
}
