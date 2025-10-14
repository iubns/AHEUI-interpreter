use crate::cell::CellValue;

const HEADER_WAT: &str = r#"
(module
  (memory $0 1)
  (export "memory" (memory $0))
  (func $run (result i64)
"#;

const FOOTER_WAT: &str = r#"
  )
  (export "run" (func $run))
)"#;

pub fn compile_aheui_to_wat(cmd_list: Vec<Vec<CellValue>>) -> String {
    let mut wat_code = String::new();
    let content =  r#"
    (local $i i64)
    (local $acc i64)

    ;; 초기화
    i64.const 1
    local.set $i

    i64.const 0
    local.set $acc

    ;; 루프 시작
    (loop $cell32
      ;; acc += i
      local.get $acc
      local.get $i
      i64.add
      local.set $acc

      ;; i += 1
      local.get $i
      i64.const 1
      i64.add
      local.tee $i

      ;; i <= 10000001 ?
      i64.const 10000001
      i64.lt_s
      br_if $cell32
    )

    ;; 결과 반환
    local.get $acc
    "#;
    let func_code = format!(
        "{}{}{}",
        HEADER_WAT,
       content,
        FOOTER_WAT
    );
    wat_code.push_str(&func_code);
    wat_code
}

/*
(module
  (func (result i32)
    (i32.const 42)
  )
  (export "helloWorld" (func 0))
)
   */

  /*
  (func $offsetFromCoordinate (param $x i32) (param $y i32) (result i32)
  get_local $y
  i32.const 50
  i32.mul
  get_local $x
  i32.add
  i32.const 4
  i32.mul
)

(export "offsetFromCoordinate" (func $offsetFromCoordinate))

*/