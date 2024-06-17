use std::{ usize };

use wasm_bindgen::prelude::*;
use crate::{
    cell::{ CellValue, Position },
    get_command,
    get_line_count,
    input_receiver::{ self, InputReceiver },
    revert_way,
    storage::{ self, Storage },
    Command,
    CommandType,
};

#[wasm_bindgen]
#[derive(Copy, Clone)]
//Todo: way 변경하기
pub struct Way {
    value: Position,
    is_reverse: bool,
}

#[wasm_bindgen]
pub struct Processor {
    #[wasm_bindgen(skip)]
    pub storage: storage::Storage,
    pub current_position: Position,
    pub next_position: Position,
    #[wasm_bindgen(skip)]
    pub cmd_list: Vec<Vec<CellValue>>,
    pub cmd_size: Position,
    #[wasm_bindgen(skip)]
    pub way: (i16, i16, bool),
    pub is_end: bool,
    #[wasm_bindgen(skip)]
    pub result_list: Vec<String>,
    pub cmd_processing_count: u64,
    pub selected_storage_for_js: usize,
    #[wasm_bindgen(skip)]
    pub input_receiver: input_receiver::InputReceiver,
}

#[wasm_bindgen]
impl Processor {
    #[wasm_bindgen(getter)]
    pub fn get_result(&self) -> Vec<String> {
        self.result_list.clone()
    }

    #[wasm_bindgen(getter)]
    pub fn get_storage(&self) -> Vec<i64> {
        if self.selected_storage_for_js >= 27 {
            return vec![];
        }
        if self.selected_storage_for_js == 21 {
            let vec: Vec<i64> = self.storage.queue.clone().into();
            return vec;
        }
        self.storage.stack[self.selected_storage_for_js].clone()
    }

    #[wasm_bindgen(setter)]
    pub fn set_selected_storage_num(&mut self, stack_num: usize) {
        self.selected_storage_for_js = stack_num;
    }

    pub fn new() -> Processor {
        Processor {
            storage: Storage::new(),
            current_position: Position {
                x: 0,
                y: 0,
            },
            next_position: Position {
                x: 0,
                y: 0,
            },
            cmd_list: Vec::new(),
            cmd_size: Position {
                x: 0,
                y: 0,
            },
            way: (0, 1, false) /* Way{
                value: Position{
                    x: 1,
                    y: 0,
                },
                is_reverse: false,
            },
            */,
            is_end: false,
            result_list: Vec::new(),
            cmd_processing_count: 0,
            selected_storage_for_js: 0,
            input_receiver: InputReceiver::new(),
        }
    }

    pub fn set_command(&mut self, cell_list: Vec<CellValue>) {
        let mut row_index = 0;
        let mut rows = Vec::new();
        while row_index <= self.cmd_size.y {
            let mut col_index = 0;
            let mut cols = Vec::new();
            while col_index <= self.cmd_size.x {
                match
                    cell_list
                        .iter()
                        .find(|cell| cell.position.x == col_index && cell.position.y == row_index)
                {
                    Some(cell) => {
                        cols.insert(col_index, *cell);
                    }
                    None => {
                        cols.insert(col_index, CellValue {
                            position: Position {
                                x: col_index,
                                y: row_index,
                            },
                            value: '웨',
                            cash_cmd: None,
                        });
                    }
                }
                col_index = col_index + 1;
            }
            rows.insert(row_index, cols);
            row_index = row_index + 1;
        }
        self.cmd_list = rows;
    }

    pub fn set_cmd_size(&mut self, cmd_size: Position) {
        self.cmd_size = cmd_size;
    }

    fn calc_next_position(&mut self) {
        let next_x_position = (self.current_position.x as i16) + self.way.0;
        if next_x_position > (self.cmd_size.x as i16) {
            self.next_position.x = 0;
        } else if next_x_position < 0 {
            self.next_position.x = self.cmd_size.x;
        } else {
            self.next_position.x = next_x_position as usize;
        }

        let next_y_position = (self.current_position.y as i16) + self.way.1;
        if next_y_position > (self.cmd_size.y as i16) {
            self.next_position.y = 0;
        } else if next_y_position < 0 {
            self.next_position.y = self.cmd_size.y;
        } else {
            self.next_position.y = next_y_position as usize;
        }
    }

    pub fn run_one_cycle(&mut self, cycle_count: i32) {
        let cycle_max = (10_000_000 * cycle_count).try_into().unwrap();
        while self.cmd_processing_count < cycle_max && !self.is_end {
            self.run_one();
            self.cmd_processing_count = self.cmd_processing_count + 1;
        }
    }

    pub fn run_one(&mut self) {
        self.current_position.x = self.next_position.x;
        self.current_position.y = self.next_position.y;

        let cell_value: Option<&mut CellValue> = match
            self.cmd_list.get_mut(self.current_position.y)
        {
            Some(row) => row.get_mut(self.current_position.x),
            None => None,
        };

        let cell_value = match cell_value {
            None => {
                self.calc_next_position();
                return;
            }
            Some(cell) => cell,
        };

        let cmd: Command = match cell_value.cash_cmd {
            Some(cmd) => cmd,
            None => {
                let cmd = get_command(&cell_value.value);
                let cmd = match cmd {
                    Some(cmd) => cmd,
                    None => {
                        self.calc_next_position();
                        return;
                    }
                };
                cell_value.cash_cmd = Some(cmd);
                cmd
            }
        };

        self.way = match cmd.way {
            (0, 0, false) => self.way,
            (x, y, true) => (self.way.0 * x, self.way.1 * y, false),
            _ => cmd.way,
        };

        match cmd.command_type {
            CommandType::Exit => {
                self.is_end = true;
                return;
            }
            CommandType::Add => self.add(),
            CommandType::Sub => self.sub(),
            CommandType::Mul => self.mul(),
            CommandType::Div => self.div(),
            CommandType::Mod => self.remainder(),
            CommandType::Push => self.push(cmd),
            CommandType::Duple => self.storage.duplicate(),
            CommandType::Pop => self.pop(cmd),
            CommandType::Swap => {
                if !self.storage.swap() {
                    revert_way(&mut self.way);
                }
            }
            CommandType::Select => self.storage.select(cmd.third_char),
            CommandType::Move => {
                let has_value = self.storage.move_value(cmd.third_char as usize);
                if !has_value {
                    revert_way(&mut self.way);
                }
            }
            CommandType::Condition => self.condition(),
            CommandType::Equal => {
                if self.storage.equal() == false {
                    revert_way(&mut self.way);
                }
            }
            CommandType::None => (),
            _ => {
                print!("형태는 구현이 필요함");
            }
        }

        self.calc_next_position();
    }

    fn add(&mut self) {
        let first = match self.storage.pop() {
            Some(value) => value,
            None => {
                revert_way(&mut self.way);
                return;
            }
        };
        let second = match self.storage.pop() {
            Some(value) => value,
            None => {
                self.storage.revert(first);
                revert_way(&mut self.way);
                return;
            }
        };
        self.storage.push(first + second);
    }

    fn sub(&mut self) {
        let first = match self.storage.pop() {
            Some(value) => value,
            None => {
                revert_way(&mut self.way);
                return;
            }
        };
        let second = match self.storage.pop() {
            Some(value) => value,
            None => {
                self.storage.revert(first);
                revert_way(&mut self.way);
                return;
            }
        };
        self.storage.push(second - first);
    }

    fn mul(&mut self) {
        let first = match self.storage.pop() {
            Some(value) => value,
            None => {
                revert_way(&mut self.way);
                return;
            }
        };
        let second = match self.storage.pop() {
            Some(value) => value,
            None => {
                self.storage.revert(first);
                revert_way(&mut self.way);
                return;
            }
        };
        self.storage.push(first * second);
    }

    fn div(&mut self) {
        let first = match self.storage.pop() {
            Some(value) => value,
            None => {
                revert_way(&mut self.way);
                return;
            }
        };
        let second = match self.storage.pop() {
            Some(value) => value,
            None => {
                self.storage.revert(first);
                revert_way(&mut self.way);
                return;
            }
        };
        self.storage.push(second / first);
    }

    fn remainder(&mut self) {
        let first = match self.storage.pop() {
            Some(value) => value,
            None => {
                revert_way(&mut self.way);
                return;
            }
        };
        let second = match self.storage.pop() {
            Some(value) => value,
            None => {
                self.storage.revert(first);
                revert_way(&mut self.way);
                return;
            }
        };
        self.storage.push(second % first);
    }

    fn push(&mut self, cmd: Command) {
        match cmd.third_char {
            // O
            21 => {
                loop {
                    let input: String = self.input_receiver.get_next_data("number");
                    match input.trim().parse::<i64>() {
                        Ok(n) => {
                            self.storage.push(n);
                            break;
                        }
                        Err(_) => {
                            eprintln!("[*] {} is invalid integer.", input);
                            self.storage.push(0);
                        }
                    }
                }
            }
            // ㅎ
            27 => {
                let input: String = self.input_receiver.get_next_data("char");
                self.storage.push(input.chars().next().unwrap() as i64);
            }
            _ => { self.storage.push(get_line_count(&cmd.third_char).try_into().unwrap()) }
        }
    }

    fn pop(&mut self, cmd: Command) {
        let value = match self.storage.pop() {
            Some(value) => value,
            None => {
                revert_way(&mut self.way);
                return;
            }
        };
        match cmd.third_char {
            27 => {
                self.result_list.push(
                    std::char
                        ::from_u32(value as u32)
                        .unwrap()
                        .to_string()
                );
            }
            21 => {
                self.result_list.push(value.to_string());
            }
            _ => {}
        }
    }

    fn condition(&mut self) {
        let target_value = match self.storage.pop() {
            Some(value) => value,
            None => {
                revert_way(&mut self.way);
                return;
            }
        };
        if target_value == 0 {
            revert_way(&mut self.way)
        }
    }
}
