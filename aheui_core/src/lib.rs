use wasm_bindgen::prelude::*;
use processor::Processor;
use cell::{CellValue, Position};

pub mod storage;
pub mod processor;
pub mod cell;

#[wasm_bindgen]
pub fn run_new(cell_list: Vec<CellValue>, cmd_size_x: usize, cmd_size_y: usize) -> Processor {
    let mut processor = Processor::new();
    processor.set_cmd_size(Position {x: cmd_size_x, y: cmd_size_y});
    processor.set_command(cell_list);
    return processor;
}

pub fn create_processor_from_string (content: &str) -> Processor{
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
    let position = Position{
        x,
        y
    };
    CellValue{
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
struct Command {
    way: (i16, i16, bool),
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

fn get_move_way(second_char: &u32) -> (i16, i16, bool){
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
        
        _ => (0, 0, false),// 기타
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

fn get_command(char: &char) -> Command {
    let unicode = *char as u32;
    
    let first_char = (unicode - 0xAC00) / (21 * 28) ;
    let second_char = (unicode - 0xAC00) % (21 * 28) / 28 ;
    let third_char = (unicode - 0xAC00) % 28 ;
    
    let command_type = match unicode > 0xAC00 {
        true => get_command_type(&first_char),
        false => CommandType::None,
    }; 
    let way = get_move_way(&second_char);

    return  Command{command_type, way, third_char};
}

fn revert_way(way: &mut (i16, i16, bool)){
    way.0 = way.0 * -1;
    way.1 = way.1 * -1;
}
