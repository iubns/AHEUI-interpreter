#[cfg(test)]
mod example_test {
    use std::{ fs, path::Path };
    use aheui_interpreter::create_processor_from_string;

    //Todo: 두가지 방법중에 무엇이 더 나은가?
    fn execute_test(test_name: &str, has_input: bool) {
        let aheui_cmd = match fs::read_to_string(format!("./tests/example/{}.aheui", test_name)) {
            Ok(v) => v,
            Err(_) => {
                panic!();
            }
        };
        let aheui_out = match fs::read_to_string(format!("./tests/example/{}.out", test_name)) {
            Ok(v) => v,
            Err(_) => {
                panic!();
            }
        };
        let mut processor = create_processor_from_string(&aheui_cmd);
        let mut cycle_count = 1;

        if has_input {
            let aheui_input = match fs::read_to_string(format!("./tests/example/{}.in", test_name)) {
                Ok(v) => v,
                Err(_) => {
                    panic!();
                }
            };
            processor.input_receiver.set_test_input_date(aheui_input);
        }

        loop {
            processor.run_one_cycle(cycle_count);
            cycle_count += 1;
            if processor.is_end {
                break;
            }
        }

        let result = processor.result_list;

        assert_eq!(aheui_out, result.join(""));
    }

    #[test]
    fn example_all_test() {
        let path = Path::new("./tests/example");
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries {
                let entry = match entry {
                    Ok(v) => v,
                    Err(_) => {
                        panic!();
                    }
                };

                match entry.path().extension() {
                    None => {
                        panic!();
                    }
                    Some(v) => {
                        if v != "aheui" {
                            continue;
                        }
                    }
                }

                let path = entry.path();
                let test_name = match path.file_stem().and_then(|v| v.to_str()) {
                    Some(v) => v,
                    None => {
                        panic!();
                    }
                };

                let aheui_cmd = match fs::read_to_string(&path) {
                    Ok(v) => v,
                    Err(_) => {
                        panic!();
                    }
                };

                let mut processor = create_processor_from_string(&aheui_cmd);
                let mut cycle_count = 1;

                match fs::read_to_string(format!("./tests/example/{}.in", test_name)) {
                    Ok(aheui_input) => {
                        processor.input_receiver.set_test_input_date(aheui_input);
                    }
                    Err(_) => (),
                }

                loop {
                    println!("{} 테스트 {}번째 실행중", test_name, cycle_count);
                    processor.run_one_cycle(cycle_count);
                    cycle_count += 1;
                    if processor.is_end {
                        break;
                    }
                }
                let result = processor.result_list;

                let aheui_out = match
                    fs::read_to_string(format!("./tests/example/{}.out", test_name))
                {
                    Ok(v) => v,
                    Err(_) => {
                        panic!();
                    }
                };

                assert_eq!(aheui_out, result.join(""));
            }
        }
    }

    #[test]
    fn add_1_to_n_speed_test() {
        execute_test("add1ToN", true);
    }

    #[test]
    fn factorization_speed_test() {
        execute_test("factorization", true);
    }
}
