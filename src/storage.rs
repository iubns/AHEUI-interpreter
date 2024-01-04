use std::collections::VecDeque;


enum StorageType {
    Stack(usize),
    Queue
}

pub struct Storage {
    stack: [Vec<i32>; 26],
    queue: VecDeque<i32>,
    selected_storage: StorageType
}

impl Storage{
    pub fn new () -> Storage {
        Storage{
            stack: Default::default(),
            queue: Default::default(),
            selected_storage: StorageType::Stack(0)
        }
    }

    pub fn push(&mut self, value: i32) {
        match self.selected_storage {
            StorageType::Stack(stack_mun) => {
                self.stack[stack_mun].push(value)
            },
            StorageType::Queue => {
                self.queue.push_back(value)
            }
        }
    }

    pub fn pop(&mut self) -> i32 {
        match self.selected_storage {
            StorageType::Stack(stack_mun) => {
                match self.stack[stack_mun].pop() {
                    Some(value) => return value,
                    None => return 0,
                }
            },
            StorageType::Queue => {
                match self.queue.pop_front() {
                    Some(value) => return value,
                    None => return 0,
                }
            }
        }
    }

    pub fn duplicate(&mut self) {
        match self.selected_storage {
            StorageType::Stack(stack_number) => {
                let last_value = match self.stack[stack_number].pop() {
                    Some(value) => value,
                    None => 0
                }; 
                self.stack[stack_number].push(last_value);
                self.stack[stack_number].push(last_value);
            },
            StorageType::Queue => {
                match self.queue.front() {
                    Some(value) => {
                        self.queue.push_back(*value)
                    },
                    None => {}
                }
            }
        }
    } 

    pub fn swap(&mut self){
        match self.selected_storage {
            StorageType::Stack(stack_number) => {
                let first = match self.stack[stack_number].pop() {
                    Some(value) => value,
                    None => return
                };
                let second =match self.stack[stack_number].pop() {
                    Some(value) => value,
                    None => {
                        self.stack[stack_number].push(first);
                        return;
                    }
                };
                self.stack[stack_number].push(second);
                self.stack[stack_number].push(first);
            },
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
}