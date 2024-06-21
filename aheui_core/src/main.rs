use std::time::Instant;

use aheui_interpreter::create_processor_from_string;

fn main() {
    let mut processor = create_processor_from_string("방반따빠쌱여뱐껴타퀘쀄쳐꼐삭더박나망희");
    processor.input_receiver.set_test_input_date("10000000".to_string());
    let mut cycle_count = 1;

    let start_time = Instant::now();

    loop {
        processor.run_one_cycle(cycle_count);
        cycle_count += 1;
        if processor.is_end {
            break;
        }
    }
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



ㅈ
*/
