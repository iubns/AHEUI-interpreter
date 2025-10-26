use web_sys::console;

use crate::{ cell::Position, processor::Processor, Command, CommandType };
use crate::wasm_funtions::{CONVERT_NUMBER_TO_UTF8, ENCODE_UTF_8};

const HEADER_WAT: &str = r#"
(module
  (memory $0 1)
  (export "memory" (memory $0))
  (func (export "run")
    (local $addr i32) ;; 출력 메모리 주소 저장용
    (local $value i32) ;; 출력할 값 저장용
"#;

pub fn compile_aheui_to_wat(_processor: &mut Processor) -> String {
    let mut wat_code = String::new();

    let mut row_index = 0;
    while row_index <= _processor.cmd_size.y {
        let mut col_index = 0;
        while col_index <= _processor.cmd_size.x {
            let position = Position{
              x: col_index,
              y: row_index,
            };
            let cell_cmd = _processor.get_cmd_from_position(position);
            let cell_wat = to_wat(cell_cmd);
            wat_code.push_str(&cell_wat);
            col_index += 1;
        }
        row_index += 1;
    }
    wat_code.push(')');
    let func_code = format!(
        "{}{}{}{})",
        HEADER_WAT,
        wat_code,
        ENCODE_UTF_8,
        CONVERT_NUMBER_TO_UTF8
    );
    console::log_1(&format!("WAT Code:\n{}", func_code).into());
    func_code
}

fn to_wat(cmd: Command) -> String {
    let wat_code = match cmd.command_type {
        CommandType::Add => "i32.add\n".to_string(),
        CommandType::Sub => "i32.sub\n".to_string(),
        CommandType::Mul => "i32.mul\n".to_string(),
        CommandType::Div => "i32.div_s\n".to_string(),
        CommandType::Mod => "i32.rem_s\n".to_string(),
        CommandType::Push => format!("i32.const {}\n", cmd.third_char_line_count),
        CommandType::Pop => {
            // 21(ㅇ)은 그냥 숫자 넣음
            if cmd.third_char == 21 {
              format!("local.set $value\n \
                (call $encode_number_to_utf8 \n \
                  (local.get $addr)\n \
                  (local.get $value)\n \
                ) \n \
                local.set $addr\n")
            } else if cmd.third_char == 27 {
              // 27(ㅎ)은 UTF-8 인코딩 함수 호출
                format!("local.set $value\n \
                (call $encode_utf8\n \
                  (local.get $addr)\n \
                  (local.get $value)\n \
                )\n \
                local.set $addr\n")
            }else{
                "drop\n".to_string()
            }
        },
        CommandType::Exit => "return\n".to_string(),
        _ => "\n".to_string(), // 다른 명령어들은 무시
    };
    format!("   {}", wat_code)
}

//밤박발따따밤다박발따따박발따따받다박발따따박다맣해