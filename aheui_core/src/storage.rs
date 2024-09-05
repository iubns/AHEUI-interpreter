use wasm_bindgen::prelude::*;
use std::{ collections::VecDeque };

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
        let mut storage = Storage {
            stack: Default::default(),
            queue: Default::default(),
            selected_storage: StorageType::Stack(0),
        };
        for stack_vec in storage.stack.iter_mut() {
            stack_vec.reserve(100_000);
        }

        storage
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

    pub fn duplicate(&mut self) -> bool {
        match self.selected_storage {
            StorageType::Stack(_) => {
                let last_value = match self.pop() {
                    Some(value) => value,
                    None => {
                        return true;
                    }
                };
                self.push(last_value);
                self.push(last_value);
            }
            StorageType::Queue => {
                match self.queue.front() {
                    Some(value) => {
                        self.queue.push_front(*value);
                    }
                    None => {
                        return true;
                    }
                }
            }
        }
        false
    }

    pub fn swap(&mut self) -> bool {
        match self.selected_storage {
            StorageType::Stack(_) => {
                let first = match self.pop() {
                    Some(value) => value,
                    None => {
                        return true;
                    }
                };
                let second = match self.pop() {
                    Some(value) => value,
                    None => {
                        self.push(first);
                        return true;
                    }
                };
                self.push(first);
                self.push(second);
                false
            }
            StorageType::Queue => {
                let first = match self.queue.pop_front() {
                    Some(value) => value,
                    None => {
                        return true;
                    }
                };
                let second = match self.queue.pop_front() {
                    Some(value) => value,
                    None => {
                        self.queue.push_front(first);
                        return true;
                    }
                };

                self.queue.push_front(first);
                self.queue.push_front(second);
                false
            }
        }
    }

    pub fn select(&mut self, value: u32) -> bool {
        match value {
            21 => {
                self.selected_storage = StorageType::Queue;
            }
            27 => {
                panic!("통로는 구현 예정입니다.");
            }
            stack_index => {
                self.selected_storage = StorageType::Stack(stack_index as usize);
            }
        }
        false
    }

    pub fn move_value(&mut self, value: usize) -> bool {
        let current_storage_value_option = match self.selected_storage {
            StorageType::Queue => self.queue.pop_front(),
            StorageType::Stack(_) => self.pop(),
        };

        let current_storage_value = match current_storage_value_option {
            Some(value) => value,
            None => {
                return true;
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
        false
    }

    pub fn equal(&mut self) -> bool {
        let first = match self.pop() {
            Some(value) => value,
            None => {
                return true;
            }
        };
        let second = match self.pop() {
            Some(value) => value,
            None => {
                self.revert(first);
                return true;
            }
        };
        let diff = second - first;
        let result = match diff {
            i if i >= 0 => 1,
            _ => 0,
        };
        self.push(result);
        false
    }

    pub fn revert(&mut self, value: i64) {
        match self.selected_storage {
            StorageType::Stack(_) => { self.push(value) }
            StorageType::Queue => { self.queue.push_front(value) }
        }
    }

    pub fn add(&mut self) -> bool {
        let first = match self.pop() {
            Some(value) => value,
            None => {
                return true;
            }
        };
        let second = match self.pop() {
            Some(value) => value,
            None => {
                self.revert(first);
                return true;
            }
        };
        self.push(first.overflowing_add(second).0);
        false
    }

    pub fn sub(&mut self) -> bool {
        let first = match self.pop() {
            Some(value) => value,
            None => {
                return true;
            }
        };
        let second = match self.pop() {
            Some(value) => value,
            None => {
                self.revert(first);
                return true;
            }
        };
        self.push(second.overflowing_sub(first).0);
        false
    }

    pub fn mul(&mut self) -> bool {
        let first = match self.pop() {
            Some(value) => value,
            None => {
                return true;
            }
        };
        let second = match self.pop() {
            Some(value) => value,
            None => {
                self.revert(first);
                return true;
            }
        };
        self.push(first.overflowing_mul(second).0);
        false
    }

    pub fn div(&mut self) -> bool {
        let first = match self.pop() {
            Some(value) => value,
            None => {
                return true;
            }
        };
        let second = match self.pop() {
            Some(value) => value,
            None => {
                self.revert(first);
                return true;
            }
        };
        self.push(second / first);
        false
    }

    pub fn remainder(&mut self) -> bool {
        let first = match self.pop() {
            Some(value) => value,
            None => {
                return true;
            }
        };
        let second = match self.pop() {
            Some(value) => value,
            None => {
                self.revert(first);
                return true;
            }
        };
        self.push(second % first);
        false
    }

    pub fn condition(&mut self) -> bool {
        let target_value = match self.pop() {
            Some(value) => value,
            None => {
                return true;
            }
        };
        if target_value == 0 {
            return true;
        }
        false
    }
}
