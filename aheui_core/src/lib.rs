use wasm_bindgen::prelude::*;
use processor::Processor;
use cell::{ CellValue, Position };

pub mod cell;
pub mod storage;
pub mod processor;
pub mod input_receiver;
pub mod break_pointer;
pub mod debugger;
pub mod wasm_parser;
// re-export parser functions to keep the public API unchanged
pub use wasm_parser::{
    get_module_info,
    parse_and_validate_wat,
    parse_wat,
    validate_wasm,
};
#[wasm_bindgen]
pub fn run_new(cell_list: Vec<CellValue>, cmd_size_x: usize, cmd_size_y: usize) -> Processor {
    let mut processor = Processor::new();
    processor.set_cmd_size(Position { x: cmd_size_x, y: cmd_size_y });
    processor.set_command(cell_list);
    return processor;
}

pub fn create_processor_from_string(content: &str) -> Processor {
    let parsed_content = parse(content);
    let mut max_col = 0;
    let mut cell_list = Vec::new();
    for (row_index, row) in parsed_content.iter().enumerate() {
        for (col_index, cell_char) in row.iter().enumerate() {
            let mut cell = get_cell_value(col_index, row_index);
            cell.value = *cell_char;
            cell_list.push(cell);
        }
        if max_col < row.len() {
            max_col = row.len();
        }
    }
    run_new(cell_list, max_col, parsed_content.len())
}

#[wasm_bindgen]
pub fn get_cell_value(x: usize, y: usize) -> CellValue {
    let position = Position {
        x,
        y,
    };
    CellValue {
        position,
        value: ' ',
        cash_cmd: None,
    }
}

#[derive(Clone, Copy)]
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

#[derive(Clone, Copy)]
pub struct Command {
    way: crate::processor::Way,
    command_type: CommandType,
    third_char: u32,
    third_char_line_count: i64,
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
fn get_line_count(third_char: &u32) -> usize {
    match third_char {
        0 | 27 => {
            return 0;
        }
        21 => {
            return 1;
        }
        1 | 4 | 19 => {
            return 2;
        }
        7 | 22 | 24 => {
            return 3;
        }
        2 | 3 | 16 | 17 | 20 | 23 | 25 | 26 => {
            return 4;
        }
        5 | 6 | 8 => {
            return 5;
        }
        18 => {
            return 6;
        }
        9 | 12 => {
            return 7;
        }
        15 => {
            return 8;
        }
        10 | 11 | 13 | 14 => {
            return 9;
        }
        _ => panic!("정의가 필요한 종성이 있음 : {}", third_char),
    }
}

fn get_move_way(second_char: &u32) -> crate::processor::Way {
    match second_char {
        0 => crate::processor::Way { value: crate::processor::WayPosition { x: 1, y: 0 }, is_reverse: false }, // ㅏ
        2 => crate::processor::Way { value: crate::processor::WayPosition { x: 2, y: 0 }, is_reverse: false }, // ㅑ
        4 => crate::processor::Way { value: crate::processor::WayPosition { x: -1, y: 0 }, is_reverse: false }, // ㅓ
        6 => crate::processor::Way { value: crate::processor::WayPosition { x: -2, y: 0 }, is_reverse: false }, // ㅕ
        8 => crate::processor::Way { value: crate::processor::WayPosition { x: 0, y: -1 }, is_reverse: false }, // ㅗ
        12 => crate::processor::Way { value: crate::processor::WayPosition { x: 0, y: -2 }, is_reverse: false }, // ㅛ
        13 => crate::processor::Way { value: crate::processor::WayPosition { x: 0, y: 1 }, is_reverse: false }, // ㅜ
        17 => crate::processor::Way { value: crate::processor::WayPosition { x: 0, y: 2 }, is_reverse: false }, // ㅠ

        18 => crate::processor::Way { value: crate::processor::WayPosition { x: 1, y: -1 }, is_reverse: true }, // ㅡ
        19 => crate::processor::Way { value: crate::processor::WayPosition { x: -1, y: -1 }, is_reverse: true }, // ㅢ
        20 => crate::processor::Way { value: crate::processor::WayPosition { x: -1, y: 1 }, is_reverse: true }, // ㅣ

        _ => crate::processor::Way { value: crate::processor::WayPosition { x: 0, y: 0 }, is_reverse: false }, // 기타
    }
}

fn parse(content: &str) -> Vec<Vec<char>> {
    let mut content_array = Vec::new();
    let lines = content.split('\n');
    for line in lines {
        let mut line_array = Vec::new();
        for c in line.chars() {
            line_array.push(c);
        }
        content_array.push(line_array);
    }
    content_array
}

fn get_command(char: &char) -> Option<Command> {
    let unicode = *char as u32;

    if unicode < 0xac00 {
        return None;
    }

    let first_char = (unicode - 0xac00) / (21 * 28);
    let second_char = ((unicode - 0xac00) % (21 * 28)) / 28;
    let third_char = (unicode - 0xac00) % 28;

    let command_type = get_command_type(&first_char);
    let way = get_move_way(&second_char);
    let third_char_line_count = get_line_count(&third_char).try_into().unwrap();

    return Some(Command { command_type, way, third_char, third_char_line_count });
}

fn revert_way(way: &mut crate::processor::Way) {
    way.value.x = way.value.x * -1;
    way.value.y = way.value.y * -1;
}
