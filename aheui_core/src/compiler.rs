use web_sys::console;

use crate::{ cell::Position, processor::Processor, Command, CommandType};

const HEADER_WAT: &str = r#"
(module
  (memory $0 1)
  (export "memory" (memory $0))
  (func (export "run") (result i64)
"#;

const FOOTER_WAT: &str = r#"
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
            console::log_1(&format!("셀 ({}, {}) -> WAT: {}", col_index, row_index, cell_wat).into());
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
    console::log_1(&format!("rowIndex: {}, colIndex: {}", _processor.cmd_size.y, _processor.cmd_size.x).into());
    for row in &_processor.cmd_list {
        let row_str: String = row.iter().map(|cell| cell.value).collect();
        console::log_1(&row_str.into());
    }
    console::log_1(&format!("WAT 코드:\n{}", func_code).into());
    func_code
}

fn to_wat(cmd: Command) -> String {
    let wat_code = match cmd.command_type {
        CommandType::Add => "i64.add\n".to_string(),
        CommandType::Sub => "i64.sub\n".to_string(),
        CommandType::Mul => "i64.mul\n".to_string(),
        CommandType::Div => "i64.div_s\n".to_string(),
        CommandType::Mod => "i64.rem_s\n".to_string(),
        CommandType::Push => format!("i64.const {}\n", cmd.third_char_line_count),
        CommandType::Exit => "return\n".to_string(),
        _ => "\n".to_string(), // 다른 명령어들은 무시
    };
    format!("   {}", wat_code)
}