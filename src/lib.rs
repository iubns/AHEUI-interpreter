use wasm_bindgen::prelude::*;
use std::collections::VecDeque;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
    fn prompt(s: &str);
}

#[wasm_bindgen]
pub fn greet(content: &str){
    prompt(content);
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
    Change,
    Duple,
    Exit,
}
struct Command {
    way: (i8, i8),
    command_type: CommandType,
    next_storage: StorageType,
}

impl Command {
    fn new(command_type: CommandType, way: (i8, i8), next_storage: StorageType) -> Command{
        Command{
            way,
            command_type,
            next_storage,
        }
    }
}


fn get_command_type(first_char: &u32) -> CommandType {
    println!("first_char {}", &first_char);
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
        17 => CommandType::Change, // ㅍ
        18 => CommandType::Exit, // ㅎ
        10 => CommandType::Move, // ㅆ
        8 => CommandType::Duple, // ㅃ
        _ => CommandType::Exit,
    }
}

fn get_move_way(second_char: &u32) -> (i8, i8){
    println!("second_char {}", &second_char);
    match second_char {
        0 => (1, 0), // ㅏ
        2 => (2, 0),// ㅑ
        4 => (-1, 0),// ㅓ
        6 => (-2, 0),// ㅕ
        8 => (0, -1),// ㅗ
        12 => (0, -2),// ㅛ
        13 => (0, 1),// ㅜ
        17 => (0, 2),// ㅠ

        //Todo: 모음 이동 방향 더 해야 함
        18 => (0, 0),// ㅡ
        19 => (0, 0), // ㅢ
        20 => (0, 0),// ㅣ
        _ => (0, 0),// 기타
    }
}

enum StorageType {
    Stack(usize),
    Queue,
}

fn get_storage_type (third_char: u32) -> StorageType{
    match third_char {
        11 => StorageType::Queue,
        _ => StorageType::Stack(third_char as usize),
    }
}

fn init_storage (storage: &mut Vec<Vec<i32>>){
    for _ in 0..26  {
        storage.push(Vec::new())
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

pub fn run(content: &str) -> &str
{
    let mut _storage : Vec<Vec<i32>> = Vec::new();
    let mut _queue: VecDeque<i32> = VecDeque::new();
    init_storage(&mut _storage);

    let content_array = parse(&content);

    let mut _position = (0, 0);
    let mut _current_storage_type = StorageType::Stack(0);
    loop {
        let line_array = content_array.get(_position.1);

        let command = match line_array {
            Some(line) => line.get(_position.0),
            None => {
                println!("none line!");
                break
            },
        };

        let cmd = match command {
            Some(char) => get_command(char),
            None => {
                println!("none char!");
                break
            }
        };

        let x = _position.0 as i8 + cmd.way.0;
        let y = _position.1 as i8 + cmd.way.1;

        match (&cmd.command_type, &_current_storage_type) {
            (CommandType::Exit, _) => {
                println!("done!");
                break
            },
            (_, StorageType::Stack(stack_mun)) => {
                let stack_option = _storage.get_mut(*stack_mun);
                if let Some(stack) = stack_option  {
                    run_command(cmd, &_current_storage_type, stack, &mut _queue)
                }
            },
            _ => ()
        }
        

        _position = (x as usize, y as usize);
        println!("{:?}", _position)
    };
    "c"
}

fn get_command(char: &char) -> Command {
    print!("{}", char);
    let unicode = *char as u32;

    let first_char = (unicode - 0xAC00) / (21 * 28) ;
    let second_char = (unicode - 0xAC00) % (21 * 28) / 28 ;
    let third_char = (unicode - 0xAC00) % 28 ;
    
    let command_type = get_command_type(&first_char);
    let way = get_move_way(&second_char);
    let next_storage_type = get_storage_type(third_char);

    return  Command::new(command_type, way, next_storage_type);
}


fn run_command(cmd:Command, current_storage_type: &StorageType, storage: &mut Vec<i32>, queue: &mut VecDeque<i32>){
    match cmd.command_type {
        CommandType::Add => add(current_storage_type, storage, queue),
        _ => println!("a")
    }
}


fn add(storage_type: &StorageType, stack: &mut Vec<i32>, queue: &mut VecDeque<i32>) {
    if let storage_type = StorageType::Queue {
        let first = queue.pop_back();
        let second = queue.pop_back();

        match (first,second) {
            (Some(x), Some(y)) => queue.push_back( x + y),
            _ => (),
        }
    }

    if let StorageType::Stack(_stack_num) = *storage_type {
        let first = stack.pop();
        let second = stack.pop();

        match (first, second) {
            (Some(x), Some(y)) => stack.push(x + y),
            _ => (),
        }
    }
}