use storage::Storage;
use wasm_bindgen::prelude::*;

pub mod storage;

use std::io;

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
    third_char: u32,
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

fn get_line_count (third_char: &u32) -> usize {
    match third_char {
        16 => return 4,
        15 => return 8,
        11 => return 9,
        7 |22 | 24 => return 3,
        1 => return  2,
        12 => return 7,
        _ => panic!("정의가 필요한 종성이 있음 : {}", third_char),
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
    let mut storage = Storage::new();

    let content_array = parse(&content);

    let mut _position = (0, 0);
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

        match (&cmd.command_type) {
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
                storage.push(first - second);
            },
            CommandType::Mul => {
                let first = storage.pop();
                let second = storage.pop();
                storage.push(first * second);
            },
            CommandType::Mod => {
                let first = storage.pop();
                let second = storage.pop();
                storage.push(first / second);
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
                        print!("{}", std::char::from_u32(value as u32).unwrap());
                    },
                    _ => {}
                }
            },
            CommandType::Change => {
                storage.swap()
            }
            _ => {
                print!("형태는 구현이 필요함")
            },
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

    return  Command{command_type, way, third_char};
}
