use crate::cell::CellValue;


pub fn compile_aheui_to_wat(cmd_list: Vec<Vec<CellValue>>) -> String {
    let mut wat_code = String::new();
    let func_code = r#"
(module
  (func $runOne (export "runOne") (param $a i32) (param $b i32) (result i32)
    local.get $a
    local.get $b
    i32.add)
    
  (memory $mem 1)
  (export "memory" (memory $mem))
)"#;
    wat_code.push_str(func_code);
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