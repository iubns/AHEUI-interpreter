pub const ENCODE_UTF_8: &str = r#"
(func $encode_utf8 (param $addr i32) (param $code i32) (result i32)
  (local $byte i32)

  ;; if code < 0x80 → 1-byte
  local.get $code
  i32.const 0x80
  i32.lt_u
  if
    local.get $addr
    local.get $code
    i32.store8

    ;; return addr + 1
    local.get $addr
    i32.const 1
    i32.add
    return
  end

  ;; if code < 0x800 → 2-byte
  local.get $code
  i32.const 0x800
  i32.lt_u
  if
    ;; byte1
    local.get $addr
    local.get $code
    i32.const 6
    i32.shr_u
    i32.const 0x1F
    i32.and
    i32.const 0xC0
    i32.or
    i32.store8

    ;; byte2
    local.get $addr
    i32.const 1
    i32.add
    local.get $code
    i32.const 0x3F
    i32.and
    i32.const 0x80
    i32.or
    i32.store8

    ;; return addr + 2
    local.get $addr
    i32.const 2
    i32.add
    return
  end

  ;; if code < 0x10000 → 3-byte
  local.get $code
  i32.const 0x10000
  i32.lt_u
  if
    ;; byte1
    local.get $addr
    local.get $code
    i32.const 12
    i32.shr_u
    i32.const 0x0F
    i32.and
    i32.const 0xE0
    i32.or
    i32.store8

    ;; byte2
    local.get $addr
    i32.const 1
    i32.add
    local.get $code
    i32.const 6
    i32.shr_u
    i32.const 0x3F
    i32.and
    i32.const 0x80
    i32.or
    i32.store8

    ;; byte3
    local.get $addr
    i32.const 2
    i32.add
    local.get $code
    i32.const 0x3F
    i32.and
    i32.const 0x80
    i32.or
    i32.store8

    ;; return addr + 3
    local.get $addr
    i32.const 3
    i32.add
    return
  end

  ;; else → 4-byte
  ;; byte1
  local.get $addr
  local.get $code
  i32.const 18
  i32.shr_u
  i32.const 0x07
  i32.and
  i32.const 0xF0
  i32.or
  i32.store8

  ;; byte2
  local.get $addr
  i32.const 1
  i32.add
  local.get $code
  i32.const 12
  i32.shr_u
  i32.const 0x3F
  i32.and
  i32.const 0x80
  i32.or
  i32.store8

  ;; byte3
  local.get $addr
  i32.const 2
  i32.add
  local.get $code
  i32.const 6
  i32.shr_u
  i32.const 0x3F
  i32.and
  i32.const 0x80
  i32.or
  i32.store8

  ;; byte4
  local.get $addr
  i32.const 3
  i32.add
  local.get $code
  i32.const 0x3F
  i32.and
  i32.const 0x80
  i32.or
  i32.store8

  ;; return addr + 4
  local.get $addr
  i32.const 4
  i32.add
)"#;

pub const CONVERT_NUMBER_TO_UTF8: &str = r#"
 (func $encode_number_to_utf8 (param $addr i32) (param $value i32) (result i32)
  (local $digits i32)   ;; 자릿수
  (local $temp i32)     ;; 임시 숫자
  (local $pos i32)      ;; 저장 위치
   
  local.get $value
  local.set $temp

  i32.const 0
  local.set $digits

  (loop $count
    local.get $temp
    i32.const 0
    i32.gt_u
    if
      local.get $temp
      i32.const 10
      i32.div_u
      local.set $temp

      local.get $digits
      i32.const 1
      i32.add
      local.set $digits

      br $count
    end
  )

  local.get $addr
  local.get $digits
  i32.add
  local.set $pos

  (loop $write
    ;; 앞자리 추출
    local.get $pos
    local.get $value
    i32.const 10
    i32.rem_u
    i32.const 0x30
    i32.add
    i32.store8

    ;; 다음 위치
    local.get $pos
    i32.const 1
    i32.sub
    local.set $pos

    ;; 다음 자릿수로
    local.get $value
    i32.const 10
    i32.div_u
    local.tee $value
    br_if $write
  )

  local.get $digits
  local.get $addr
  i32.add
)
"#;