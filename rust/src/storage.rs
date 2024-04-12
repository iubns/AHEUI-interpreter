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
                let second = match self.stack[stack_number].pop() {
                    Some(value) => value,
                    None => {
                        self.stack[stack_number].push(first);
                        return;
                    }
                };
                self.stack[stack_number].push(first);
                self.stack[stack_number].push(second);
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

    pub fn select(&mut self, value: u32){
        match value {
            21 => {
                self.selected_storage = StorageType::Queue
            }
            27 => {
                panic!("통로는 구현 예정입니다.")
            }
            stack_index => {
                self.selected_storage = StorageType::Stack(stack_index as usize)
            }
        }
    }

    pub fn move_value(&mut self, value: usize) -> bool{
        let current_storage_value_option = match self.selected_storage {
            StorageType::Queue => self.queue.pop_front(),
            StorageType::Stack(stack_index) => self.stack[stack_index].pop()
        };

        let current_storage_value = match current_storage_value_option {
            Some(value) => value,
            None => return false
        };
        
        match value {
            21 => {
                self.queue.push_back(current_storage_value)
            }
            27 => {
                panic!("통로는 구현 예저입니다.")
            }
            stack_index => {
                self.stack[stack_index].push(current_storage_value)
            }
        }
        return  true;
    }

    pub fn equal(&mut self){
        let first = self.pop();
        let second = self.pop();
        let diff = second - first;
        let result = match diff {
            i if i >= 0 => 1,
            _ => 0
        };
        self.push(result);
    }
}