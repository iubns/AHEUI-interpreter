use wasm_bindgen::prelude::*;

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
    Insert(i8),
    Out(i32),
    Add,
    Sub,
    Mul,
    Div,
    Mod,
    None,
    Pop,
    Exit,
}
struct Command {
    way: (i8, i8),
    command_type: CommandType
}

impl Command {
    fn new(command_type: CommandType, way: (i8, i8)) -> Command{
        Command{
            way,
            command_type,
        }
    }
}

fn get_command_type(first_char: &u32) -> CommandType {
    println!("first_char {}", &first_char);
    match first_char {
        0 | 1 => CommandType::None, //ㄱㄲ
        3 => CommandType::Add, //ㄷ
        16 => CommandType::Sub, //ㅌ
        4 => CommandType::Mul, // ㄸ
        2 => CommandType::Div, // ㄴ
        5 => CommandType::Mod, // ㄹ
        11 => CommandType::None, //ㅇ
        7 => CommandType::Insert(0), //ㅂ
        6 => CommandType::Pop, //ㅁ

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

        18 => (0, 0),// ㅡ
        19 => (0, 0), // ㅢ
        20 => (0, 0),// ㅣ
        _ => (0, 0),// 기타
    }
}


pub fn run(content: &str) -> &str
{
    let mut content_array = Vec::new();
    let lines = content.split('\n');
    for line in lines {
        let mut line_array = Vec::new();
        for c in line.chars()
        {
            line_array.push(c);
        };
        content_array.push(line_array);
    }


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

        match cmd.command_type {
            CommandType::Exit => {
                println!("done!");
                break
            },
            _ => run_command(cmd),
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

    return  Command::new(command_type, way);
}


fn run_command(cmd:Command){
    match cmd {
        _ => println!("a")
    }
}
