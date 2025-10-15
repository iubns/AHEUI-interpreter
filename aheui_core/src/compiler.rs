use web_sys::console;

use crate::{ cell::Position, processor::Processor, Command, CommandType};

const HEADER_WAT: &str = r#"
(module
  (memory $0 1)
  (export "memory" (memory $0))
  (func (export "run") (result i32)
"#;

//Todo: 메모리 주소 고정에서 변동으로 바꿔야 함.
const FOOTER_WAT: &str = r#"
  )
 (func $encode_utf8 (param $code i32) (result i32)
    ;; if code < 0x80 → 1-byte
    local.get $code
    i32.const 0x80
      
    i32.lt_u
    if
      local.get $code
      i32.const 0
      i32.store8
      i32.const 1
      return
    end

    ;; if code < 0x800 → 2-byte
    local.get $code
    i32.const 0x800
    i32.lt_u
    if
      ;; byte1 = 0xC0 | ((code >> 6) & 0x1F)
      i32.const 0
      local.get $code
      i32.const 6
      i32.shr_u
      i32.const 0x1F
      i32.and
      i32.const 0xC0
      i32.or
      i32.store8

      ;; byte2 = 0x80 | (code & 0x3F)
      i32.const 1
      local.get $code
      i32.const 0x3F
      i32.and
      i32.const 0x80
      i32.or
      i32.store8

      i32.const 2
      return
    end

    ;; if code < 0x10000 → 3-byte
    local.get $code
    i32.const 0x10000
    i32.lt_u
    if
      ;; byte1 = 0xE0 | ((code >> 12) & 0x0F)
      i32.const 0
      local.get $code
      i32.const 12
      i32.shr_u
      i32.const 0x0F
      i32.and
      i32.const 0xE0
      i32.or
      i32.store8
      
      ;; byte2 = 0x80 | ((code >> 6) & 0x3F)
      i32.const 1
      local.get $code
      i32.const 6
      i32.shr_u
      i32.const 0x3F
      i32.and
      i32.const 0x80
      i32.or
      i32.store8

      ;; byte3 = 0x80 | (code & 0x3F)
      i32.const 2
      local.get $code
      i32.const 0x3F
      i32.and
      i32.const 0x80
      i32.or
      i32.store8

      i32.const 3
      return
    end

    ;; else → 4-byte
    ;; byte1 = 0xF0 | ((code >> 18) & 0x07)
    i32.const 0
    local.get $code
    i32.const 18
    i32.shr_u
    i32.const 0x07
    i32.and
    i32.const 0xF0
    i32.or
    i32.store8

    ;; byte2 = 0x80 | ((code >> 12) & 0x3F)
    i32.const 1
    local.get $code
    i32.const 12
    i32.shr_u
    i32.const 0x3F
    i32.and
    i32.const 0x80
    i32.or
    i32.store8

    ;; byte3 = 0x80 | ((code >> 6) & 0x3F)
    i32.const 2
    local.get $code
    i32.const 6
    i32.shr_u
    i32.const 0x3F
    i32.and
    i32.const 0x80
    i32.or
    i32.store8

    ;; byte4 = 0x80 | (code & 0x3F)
    i32.const 3
    local.get $code
    i32.const 0x3F
    i32.and
    i32.const 0x80
    i32.or
    i32.store8

    i32.const 4
  )
)"#;

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
    let func_code = format!(
        "{}{}{}",
        HEADER_WAT,
       wat_code,
        FOOTER_WAT
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
                format!("\n")
            } else if cmd.third_char == 27 {
              // 27(ㅎ)은 UTF-8 인코딩 함수 호출
                format!("call $encode_utf8\n")
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