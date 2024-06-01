use std::{any::Any, io};

use wasm_bindgen::prelude::*;
use crate::{
    cell::{CellValue, Position}, get_command, get_line_count, revert_way, storage::{self, Storage}, CommandType 
};

#[wasm_bindgen]
extern "C" {
    // Use `js_namespace` here to bind `console.log(..)` instead of just
    // `log(..)`
    #[wasm_bindgen(js_namespace = console)]
    fn log(s: &str);

    // The `console.log` is quite polymorphic, so we can bind it with multiple
    // signatures. Note that we need to use `js_name` to ensure we always call
    // `log` in JS.
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_u32(a: u32);

    // Multiple arguments too!
    #[wasm_bindgen(js_namespace = console, js_name = log)]
    fn log_many(a: &str, b: &str);
}

macro_rules! console_log {
    // Note that this is using the `log` function imported above during
    // `bare_bones`
    ($($t:tt)*) => (log(&format_args!($($t)*).to_string()))
}

#[wasm_bindgen]
#[derive(Copy, Clone)]
//Todo: way 변경하기
pub struct Way {
    value: Position,
    isReverse: bool
}

#[wasm_bindgen]
pub struct Processor {
    #[wasm_bindgen(skip)]
    pub storage: storage::Storage,
    pub current_position: Position,
    pub next_position: Position,
    #[wasm_bindgen(skip)]
    pub cmd_list: Vec<CellValue>,
    pub cmd_size: Position,
    #[wasm_bindgen(skip)]
    pub way: (i8, i8, bool),
    pub isEnd: bool,
    #[wasm_bindgen(skip)]
    pub result_list: Vec<String>,
}

#[wasm_bindgen]
impl Processor {
    #[wasm_bindgen(getter)]
    pub fn cmd_list(&self) -> Vec<CellValue> {
        self.cmd_list()
    }

    #[wasm_bindgen(getter)]
    pub fn get_result(&self) -> Vec<String> {
        self.result_list.clone()
    }

    pub fn new () -> Processor {
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
            cmd_size: Position{
                x: 0,
                y: 0,
            },
            way: (1,0, false)/* Way{
                value: Position{
                    x: 1,
                    y: 0,
                },
                isReverse: false,
            },
            */,
            isEnd: false,
            result_list: Vec::new()
        }
    }

    pub fn set_command (&mut self, cell_list: Vec<CellValue>) {
        self.cmd_list = cell_list;
    }

    pub fn set_cmd_size(&mut self, cmd_size: Position) {
        self.cmd_size = cmd_size;
    }

    pub fn run_one (&mut self) {
        self.current_position.x = self.next_position.x;
        self.current_position.y = self.next_position.y;
        
        if self.cmd_size.x < self.current_position.x 
        {
            self.current_position.x = 0;
        }

        if self.cmd_size.y < self.current_position.y 
        {
            self.current_position.y = 0;
        }

        let cell_value = self.cmd_list.iter().find(|cmd| cmd.position.x == self.current_position.x && cmd.position.y == self.current_position.y);

        let cmd = match cell_value {
            Some(cell) => get_command(&cell.value),
            None => {
                self.next_position.x = self.current_position.x + self.way.0;
                self.next_position.y = self.current_position.y + self.way.1;
                return;
            },
        };

        self.way = match cmd.way {
            (0, 0, false) => self.way,
            (x, y, true) => (cmd.way.0 * x, cmd.way.1 * y, false),
            _ => cmd.way,
        };


        match &cmd.command_type {
            CommandType::Exit => {
                println!("done!");
                self.isEnd = true;
                return;
            },
            CommandType::Add => {
                let first = self.storage.pop();
                let second = self.storage.pop();
                self.storage.push(first + second);
            },
            CommandType::Sub => {
                let first = self.storage.pop();
                let second = self.storage.pop();
                self.storage.push(second - first);
            },
            CommandType::Mul => {
                let first = self.storage.pop();
                let second = self.storage.pop();
                self.storage.push(first * second);
            },
            CommandType::Div => {
                let first = self.storage.pop();
                let second = self.storage.pop();
                self.storage.push(second / first);
            },
            CommandType::Mod => {
                let first = self.storage.pop();
                let second = self.storage.pop();
                self.storage.push(second % first);
            },
            CommandType::Push => {
                match cmd.third_char {
                    // O
                    21 => {
                        let mut input: String = String::new();

                        match io::stdin().read_line(&mut input) {
                            Ok(_) => {
                                match input.trim().parse::<i32>() {
                                    Ok(n) => {
                                        self.storage.push(n);
                                    },
                                    Err(_) => {
                                        eprintln!("[*] {} is invalid integer.", input);
                                        self.storage.push(0);
                                    }
                                }
                            },
                            Err(_) => {
                                eprintln!("[*] Cannot read a line from stdin.");
                                self.storage.push(0);
                            }
                        };
                    },
                    // ㅎ
                    27 => {
                        let mut input: String = String::new();
                        self.storage.push(match io::stdin().read_line(&mut input) {
                            Ok(_) => {
                                input.chars().next().unwrap() as i32
                            },
                            Err(_) => {
                                eprintln!("[*] Cannot read a line from stdin.");
                                0
                            }
                        });
                    },
                    _ => {
                        self.storage.push(get_line_count(&cmd.third_char).try_into().unwrap())
                    }
                }
            },
            CommandType::Duple => {
                self.storage.duplicate()
            },
            CommandType::Pop => {
                let value = self.storage.pop();
                match cmd.third_char {
                    27 => {
                        self.result_list.push(std::char::from_u32(value as u32).unwrap().to_string());
                    },
                    21 => {
                        self.result_list.push(value.to_string());
                    }
                    _ => {}
                }
            },
            CommandType::Swap => {
                self.storage.swap()
            }
            CommandType::Select => {
                self.storage.select(cmd.third_char)
            }
            CommandType::Move => {
                let has_value = self.storage.move_value(cmd.third_char as usize);
                if !has_value {revert_way(&mut self.way)}
            }
            CommandType::Condition => {
                let target_value = self.storage.pop();
                if target_value == 0 {revert_way(&mut self.way)};
            }
            CommandType::Equal => {
                self.storage.equal()
            }
            _ => {
                print!("형태는 구현이 필요함")
            },
        }

        self.next_position.x = match self.current_position.x + self.way.0 {
            -1 => self.cmd_size.x - 1,
            //self.cmd_size.x => 0,
            _ => self.current_position.x + self.way.0,
        };
        self.next_position.y = match self.current_position.y + self.way.1 {
            -1 => self.cmd_size.y - 1,
            //self.cmd_size.x => 0,
            _ => self.current_position.y + self.way.1
        };
        
    }
}