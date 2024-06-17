use wasm_bindgen::prelude::*;
use std::collections::VecDeque;

#[derive(Clone)]
pub enum StorageType {
    Stack(usize),
    Queue,
}

#[wasm_bindgen]
#[derive(Clone)]
pub struct Storage {
    #[wasm_bindgen(skip)]
    pub stack: [Vec<i64>; 27],
    #[wasm_bindgen(skip)]
    pub queue: VecDeque<i64>,
    #[wasm_bindgen(skip)]
    pub selected_storage: StorageType,
}

#[wasm_bindgen]
impl Storage {
    pub fn new() -> Storage {
        Storage {
            stack: Default::default(),
            queue: Default::default(),
            selected_storage: StorageType::Stack(0),
        }
    }

    pub fn push(&mut self, value: i64) {
        match self.selected_storage {
            StorageType::Stack(stack_mun) => { self.stack[stack_mun].push(value) }
            StorageType::Queue => { self.queue.push_back(value) }
        }
    }

    pub fn pop(&mut self) -> Option<i64> {
        match self.selected_storage {
            StorageType::Stack(stack_mun) => { self.stack[stack_mun].pop() }
            StorageType::Queue => { self.queue.pop_front() }
        }
    }

    pub fn duplicate(&mut self) {
        match self.selected_storage {
            StorageType::Stack(_) => {
                let last_value = match self.pop() {
                    Some(value) => value,
                    None => 0,
                };
                self.push(last_value);
                self.push(last_value);
            }
            StorageType::Queue => {
                match self.queue.front() {
                    Some(value) => { self.queue.push_back(*value) }
                    None => {}
                }
            }
        }
    }

    pub fn swap(&mut self) {
        match self.selected_storage {
            StorageType::Stack(_) => {
                let first = match self.pop() {
                    Some(value) => value,
                    None => {
                        return;
                    }
                };
                let second = match self.pop() {
                    Some(value) => value,
                    None => {
                        self.push(first);
                        return;
                    }
                };
                self.push(first);
                self.push(second);
            }
            StorageType::Queue => {
                let first = match self.queue.pop_front() {
                    Some(value) => value,
                    None => {
                        return;
                    }
                };
                let second = match self.queue.pop_front() {
                    Some(value) => value,
                    None => {
                        self.queue.push_back(first);
                        return;
                    }
                };

                self.queue.push_front(second);
                self.queue.push_front(first);
            }
        }
    }

    pub fn select(&mut self, value: u32) {
        match value {
            21 => {
                self.selected_storage = StorageType::Queue;
            }
            27 => { panic!("통로는 구현 예정입니다.") }
            stack_index => {
                self.selected_storage = StorageType::Stack(stack_index as usize);
            }
        }
    }

    pub fn move_value(&mut self, value: usize) -> bool {
        let current_storage_value_option = match self.selected_storage {
            StorageType::Queue => self.queue.pop_front(),
            StorageType::Stack(_) => self.pop(),
        };

        let current_storage_value = match current_storage_value_option {
            Some(value) => value,
            None => {
                return false;
            }
        };

        match value {
            21 => {
                self.queue.push_back(current_storage_value);
            }
            27 => {
                panic!("통로는 구현 예정입니다.");
            }
            stack_mun => {
                self.stack[stack_mun].push(current_storage_value);
            }
        }
        return true;
    }

    pub fn equal(&mut self) -> bool {
        let first = match self.pop() {
            Some(value) => value,
            None => {
                return false;
            }
        };
        let second = match self.pop() {
            Some(value) => value,
            None => {
                self.revert(first);
                return false;
            }
        };
        let diff = second - first;
        let result = match diff {
            i if i >= 0 => 1,
            _ => 0,
        };
        self.push(result);
        true
    }

    pub fn revert(&mut self, value: i64) {
        match self.selected_storage {
            StorageType::Stack(_) => { self.push(value) }
            StorageType::Queue => { self.queue.push_front(value) }
        }
    }
}
