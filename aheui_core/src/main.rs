use std::time::Instant;

use aheui_interpreter::create_processor_from_string;

fn main() {
    let mut processor = create_processor_from_string(
        "아　　　밣붏　　　희
　　　　뷾뚜
　　　밧도밞두
　　　또뚜몋붋
　　따볼붏지따북
　　봁퇴듀우근두
　맣봀뗘범떠벋밝뗘
　　　　밚뚜
　　　　뚜벞
　　　　맣희"
    );
    processor.input_receiver.set_test_input_date("10000000".to_string());

    let start_time = Instant::now();

    processor.run_all_cycle();
    let end_time = Instant::now();
    let elapsed_time = end_time.duration_since(start_time);

    print!("{:}", elapsed_time.as_millis());
}

/*
ㄱ
ㄲ
ㄴ
ㄷ
ㄸ
ㄹ
ㅁ
ㅂ
ㅃ
ㅅ
ㅆ
ㅇ
ㅈ
ㅉ
ㅊ
ㅋ
ㅌ
ㅍ
ㅎ
*/
