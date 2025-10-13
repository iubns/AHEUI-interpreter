use std::usize;

use wasm_bindgen::prelude::*;
use crate::{
    cell::{ CellValue, Position }, compiler::compile_aheui_to_wat, debugger::Debugger, get_command, input_receiver::{ self, InputReceiver }, revert_way, storage::{ self, Storage }, wasm_parser::{parse_and_validate_wat, WasmParseResult}, Command, CommandType
};

#[derive(Copy, Clone)]
pub struct WayPosition {
    pub x: i16,
    pub y: i16,
}


#[derive(Copy, Clone)]
pub struct Way {
    pub value: WayPosition,
    pub is_reverse: bool,
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
    pub way: Way,
    pub is_end: bool,
    #[wasm_bindgen(skip)]
    pub result_list: Vec<String>,
    pub cmd_processing_count: u64,
    pub selected_storage_for_js: usize,
    #[wasm_bindgen(skip)]
    pub input_receiver: input_receiver::InputReceiver,
    pub high_surrogate: Option<u32>
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

    #[wasm_bindgen]
    pub fn compile_to_wasm(&mut self,) -> WasmParseResult {
        let wat = compile_aheui_to_wat(self.cmd_list.clone());
        return parse_and_validate_wat(&wat);
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
            way: Way {
                value: WayPosition { x: 0, y: 1 },
                is_reverse: false,
            },
            is_end: false,
            result_list: Vec::new(),
            cmd_processing_count: 0,
            selected_storage_for_js: 0,
            input_receiver: InputReceiver::new(),
            high_surrogate: None,
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

    pub fn run_with_debug(&mut self, cycle_count: i32, debugger: &Debugger) -> bool {
        let cycle_max = (10_000_000 * cycle_count).try_into().unwrap();
        while self.cmd_processing_count < cycle_max && !self.is_end {
            self.run_one();
            self.cmd_processing_count += 1;
            if debugger.has_break_pinter_at(self.next_position) {
                return true;
            }
        }
        false
    }

    pub fn run_one_cycle(&mut self, cycle_count: i32) {
        if cycle_count > 100 {
            self.is_end = true;
            return;
        }
        let cycle_max = (10_000_000 * cycle_count).try_into().unwrap();
        while self.cmd_processing_count < cycle_max && !self.is_end {
            self.run_one();
            self.cmd_processing_count = self.cmd_processing_count + 1;
        }
    }

    pub fn run_all_cycle(&mut self) {
        let mut cycle_count = 1;
        loop {
            self.run_one_cycle(cycle_count);
            if self.is_end {
                return;
            }
            cycle_count += 1;
        }
    }

    pub fn run_all_cycle_with_debug(&mut self) {
        let mut cycle_count = 1;
        let debugger = Debugger::new();
        loop {
            self.run_with_debug(cycle_count, &debugger);
            if self.is_end {
                return;
            }
            cycle_count += 1;
        }
    }

    pub fn run_one(&mut self) {
        self.current_position.x = self.next_position.x;
        self.current_position.y = self.next_position.y;

        let cmd = match self.get_cmd_from_position() {
            Some(cmd) => cmd,
            None => {
                self.calc_next_position();
                return;
            }
        };

        let is_revert_way = match cmd.command_type {
            CommandType::Exit => {
                self.is_end = true;
                return;
            }
            CommandType::Add => self.storage.add(),
            CommandType::Sub => self.storage.sub(),
            CommandType::Mul => self.storage.mul(),
            CommandType::Div => self.storage.div(),
            CommandType::Mod => self.storage.remainder(),
            CommandType::Push => self.push(cmd),
            CommandType::Duple => self.storage.duplicate(),
            CommandType::Pop => self.pop(cmd),
            CommandType::Swap => self.storage.swap(),
            CommandType::Select => self.storage.select(cmd.third_char),
            CommandType::Move => self.storage.move_value(cmd.third_char as usize),
            CommandType::Condition => self.storage.condition(),
            CommandType::Equal => self.storage.equal(),
            CommandType::None => false,
        };

        self.way = match cmd.way {
            Way { value: WayPosition { x: 0, y: 0 }, is_reverse: false } => self.way,
            Way { value, is_reverse: true } => Way {
                value: WayPosition {
                    x: self.way.value.x * value.x,
                    y: self.way.value.y * value.y,
                },
                is_reverse: false,
            },
            way => way,
        };

        if is_revert_way {
            revert_way(&mut self.way);
        }

        self.calc_next_position();
    }

    fn calc_next_position(&mut self) {
    let next_x_position = (self.current_position.x as i16) + self.way.value.x;
        if next_x_position > (self.cmd_size.x as i16) {
            self.next_position.x = 0;
        } else if next_x_position < 0 {
            self.next_position.x = self.cmd_size.x;
        } else {
            self.next_position.x = next_x_position.max(0) as usize;
        }

    let next_y_position = (self.current_position.y as i16) + self.way.value.y;
        if next_y_position > (self.cmd_size.y as i16) {
            self.next_position.y = 0;
        } else if next_y_position < 0 {
            self.next_position.y = self.cmd_size.y;
        } else {
            self.next_position.y = next_y_position.max(0) as usize;
        }
    }

    fn get_cmd_from_position(&mut self) -> Option<Command> {
        let position = self.current_position;
        //전처리 (cmd setting)에서 빈 공간 없게 했기때문에 예외처리 안해도 됨
        let cell_value = &mut self.cmd_list[position.y][position.x];

        match cell_value.cash_cmd {
            Some(cmd) => Some(cmd),
            None => {
                let cmd = get_command(&cell_value.value);
                match cmd {
                    Some(cmd) => {
                        cell_value.cash_cmd = Some(cmd);
                    }
                    None => {
                        return None;
                    }
                }
                cmd
            }
        }
    }

    fn push(&mut self, cmd: Command) -> bool {
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
            _ => {
                self.storage.push(cmd.third_char_line_count);
            }
        }
        false
    }

    pub fn is_surrogate(&mut self, value: u32) -> bool {
        (0xd800..=0xdbff).contains(&value) || (0xdc00..=0xdfff).contains(&value)
    }

    fn pop(&mut self, cmd: Command) -> bool {
        let value = match self.storage.pop() {
            Some(value) => value,
            None => {
                return true;
            }
        };
        match cmd.third_char {
            27 => {
                match self.is_surrogate(value as u32) {
                    true => {
                        if let Some(high_surrogate) = self.high_surrogate {
                            let combined_char = std::char
                                ::from_u32(
                                    ((high_surrogate - 0xd800) << 10) +
                                        ((value as u32) - 0xdc00) +
                                        0x10000
                                )
                                .unwrap();
                            self.result_list.push(combined_char.to_string());
                            self.high_surrogate = None;
                        } else {
                            self.high_surrogate = Some(value as u32);
                        }
                    }
                    false => {
                        if let Some(_high_surrogate) = self.high_surrogate {
                            self.result_list.push("�".to_string());
                            self.high_surrogate = None; // 초기화
                        } else {
                            self.result_list.push(
                                std::char
                                    ::from_u32(value as u32)
                                    .unwrap()
                                    .to_string()
                            );
                        }
                    }
                }
            }
            21 => {
                self.result_list.push(value.to_string());
            }
            _ => {}
        }
        false
    }
}
