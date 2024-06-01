use wasm_bindgen::prelude::*;
use storage::Storage;
use processor::Processor;
use cell::{CellValue, Position};

pub mod storage;
pub mod processor;
pub mod cell;

use std::io;

#[wasm_bindgen]
pub fn run_new(cell_list: Vec<CellValue>, cmd_size_x: i8, cmd_size_y: i8) -> Processor {
    let mut processor = Processor::new();
    processor.set_cmd_size(Position {x: cmd_size_x, y: cmd_size_y});
    processor.set_command(cell_list);
    return processor;
}

#[wasm_bindgen]
pub fn get_cell_value(x: i8, y: i8) -> CellValue {
    let position = Position{
        x,
        y
    };
    CellValue{
        position,
        value: ' '
    }
}

enum CommandType {
    Push,
    Pop,
    Add,
    Sub,
    Mul,
    Div,
    Mod,
    None,
    Select,
    Move,
    Equal,
    Condition,
    Swap,
    Duple,
    Exit,
}
struct Command {
    way: (i8, i8, bool),
    command_type: CommandType,
    third_char: u32,
}


fn get_command_type(first_char: &u32) -> CommandType {
    match first_char {
        0 | 1 | 15 => CommandType::None, //ㄱ ㄲ ㅋ
        3 => CommandType::Add, //ㄷ
        16 => CommandType::Sub, //ㅌ
        4 => CommandType::Mul, // ㄸ
        2 => CommandType::Div, // ㄴ
        5 => CommandType::Mod, // ㄹ
        11 => CommandType::None, //ㅇ
        7 => CommandType::Push, //ㅂ
        6 => CommandType::Pop, //ㅁ
        9 => CommandType::Select, // ㅅ
        12 => CommandType::Equal, // ㅈ
        14 => CommandType::Condition, // ㅊ
        17 => CommandType::Swap, // ㅍ
        18 => CommandType::Exit, // ㅎ
        10 => CommandType::Move, // ㅆ
        8 => CommandType::Duple, // ㅃ
        _ => CommandType::Exit,
    }
}

//없음, 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
fn get_line_count (third_char: &u32) -> usize {
    match third_char {
        0 | 27 => return 0,
        21 => return 1,
        1 | 4 | 19 => return  2,
        7 | 22 | 24 => return 3,
        2 | 3 | 16 | 17 | 20 | 23 | 25 | 26 => return 4,
        5 | 6 | 8 => return 5,
        18 => return 6,
        9 | 12 => return 7,
        15 => return 8,
        10 | 11 | 13 | 14  => return 9,
        _ => panic!("정의가 필요한 종성이 있음 : {}", third_char),
    }
}

fn get_move_way(second_char: &u32) -> (i8, i8, bool){
    match second_char {
        0 => (1, 0, false), // ㅏ
        2 => (2, 0, false),// ㅑ
        4 => (-1, 0, false),// ㅓ
        6 => (-2, 0, false),// ㅕ
        8 => (0, -1, false),// ㅗ
        12 => (0, -2, false),// ㅛ
        13 => (0, 1, false),// ㅜ
        17 => (0, 2, false),// ㅠ

        18 => (1, -1, true),// ㅡ
        19 => (-1, -1, true), // ㅢ
        20 => (-1, 1, true),// ㅣ
        
        _ => (1, 0, false),// 기타
    }
}


fn parse(content: & str) -> Vec<Vec<char>>{
 let mut content_array = Vec::new();
    let lines = content.split('\n');
    for line in lines {
        let mut line_array = Vec::new();
        for c in line.chars()
        {
            line_array.push(c);
        };
        content_array.push(line_array);
    };
    content_array
}

pub fn run(content: &str) -> Vec<String>
{
    let mut storage = Storage::new();

    let content_array = parse(&content);

    let mut _position = (0, 0);
    let mut way = (0, 0, false);
    let mut result_list = Vec::new();

    loop {
        let line_array = content_array.get(_position.1);

        let command = match line_array {
            Some(line) => {
                line.get(_position.0)
            },
            None => {
                println!("none line!");
                break
            },
        };

        let count_of_line = match line_array {
            Some(line) => line.len(),
            None => 0,
        };


        let cmd = match command {
            Some(char) => get_command(char),
            None => {
                let mut x = match (_position.0, way.0) {
                    (0, -1) => count_of_line as i8 - 1,
                    _ => _position.0 as i8 + way.0
                };
                let y = _position.1 as i8 + way.1;
        
                if x > count_of_line as i8 { x = 0; }

                _position = (x as usize, y as usize);
                continue;
            }
        };

        way = match cmd.way {
            (0, 0, false) => way,
            (x, y, true) => (way.0 * x, way.1 * y, false),
            _ => cmd.way,
        };

        match &cmd.command_type {
            CommandType::Exit => {
                println!("done!");
                break
            },
            CommandType::Add => {
                let first = storage.pop();
                let second = storage.pop();
                storage.push(first + second);
            },
            CommandType::Sub => {
                let first = storage.pop();
                let second = storage.pop();
                storage.push(second - first);
            },
            CommandType::Mul => {
                let first = storage.pop();
                let second = storage.pop();
                storage.push(first * second);
            },
            CommandType::Div => {
                let first = storage.pop();
                let second = storage.pop();
                storage.push(second / first);
            },
            CommandType::Mod => {
                let first = storage.pop();
                let second = storage.pop();
                storage.push(second % first);
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
                                        storage.push(n);
                                    },
                                    Err(_) => {
                                        eprintln!("[*] {} is invalid integer.", input);
                                        storage.push(0);
                                    }
                                }
                            },
                            Err(_) => {
                                eprintln!("[*] Cannot read a line from stdin.");
                                storage.push(0);
                            }
                        };
                    },
                    // ㅎ
                    27 => {
                        let mut input: String = String::new();
                        storage.push(match io::stdin().read_line(&mut input) {
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
                        storage.push(get_line_count(&cmd.third_char).try_into().unwrap())
                    }
                }
            },
            CommandType::Duple => {
                storage.duplicate()
            },
            CommandType::Pop => {
                let value = storage.pop();
                match cmd.third_char {
                    27 => {
                        result_list.push(std::char::from_u32(value as u32).unwrap().to_string());
                    },
                    21 => {
                        result_list.push(value.to_string());
                    }
                    _ => {}
                }
            },
            CommandType::Swap => {
                storage.swap()
            },
            CommandType::Select => {
                storage.select(cmd.third_char)
            },
            CommandType::Move => {
                let has_value = storage.move_value(cmd.third_char as usize);
                if !has_value {revert_way(&mut way)}
            },
            CommandType::Condition => {
                let target_value = storage.pop();
                if target_value == 0 {revert_way(&mut way)};
            },
            CommandType::Equal => {
                storage.equal()
            },
            CommandType::None => {
                
            },
            _ => {
                print!("형태는 구현이 필요함")
            },
        }
        
        let mut x = match (_position.0, way.0) {
            (0, -1) => count_of_line as i8 - 1,
            _ => _position.0 as i8 + way.0
        };
        let y = _position.1 as i8 + way.1;

        if x > count_of_line as i8 { x = 0; }

        _position = (x as usize, y as usize);
        //println!("{:?}", _position)
    };

    return result_list;
}

fn get_command(char: &char) -> Command {
    //print!("{}", char);
    let unicode = *char as u32;

    let first_char = (unicode - 0xAC00) / (21 * 28) ;
    let second_char = (unicode - 0xAC00) % (21 * 28) / 28 ;
    let third_char = (unicode - 0xAC00) % 28 ;
    
    let command_type = get_command_type(&first_char);
    let way = get_move_way(&second_char);

    return  Command{command_type, way, third_char};
}

fn revert_way(way: &mut (i8, i8, bool)){
    way.0 = way.0 * -1;
    way.1 = way.1 * -1;
}