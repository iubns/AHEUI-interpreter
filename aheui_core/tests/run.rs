#[cfg(test)]
mod run_test {
    use std::{ fs, path::Path, time::{ Duration, Instant } };
    use aheui_interpreter::create_processor_from_string;

    fn execute_speed_test(test_name: &str, has_input: bool) -> Duration {
        let _test_folder = "./tests/speed_test_cases";
        let aheui_cmd = match fs::read_to_string(format!("{}/{}.aheui", _test_folder, test_name)) {
            Ok(v) => v,
            Err(_) => {
                panic!();
            }
        };
        let aheui_out = match fs::read_to_string(format!("{}/{}.out", _test_folder, test_name)) {
            Ok(v) => v,
            Err(_) => {
                panic!();
            }
        };

        let start_time = Instant::now();
        let mut processor = create_processor_from_string(&aheui_cmd);

        if has_input {
            let aheui_input = match
                fs::read_to_string(format!("{}/{}.in", _test_folder, test_name))
            {
                Ok(v) => v,
                Err(_) => {
                    panic!();
                }
            };
            processor.input_receiver.set_test_input_date(aheui_input);
        }
        processor.run_all_cycle();

        let end_time = Instant::now();
        let elapsed_time = end_time.duration_since(start_time);
        let result = processor.result_list;

        assert_eq!(aheui_out, result.join(""));
        return elapsed_time;
    }

    #[test]
    fn auto_all_test() {
        let _test_folder = "./tests/auto_test_cases";
        let path = Path::new(_test_folder);
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

                match fs::read_to_string(format!("{}/{}.in", _test_folder, test_name)) {
                    Ok(aheui_input) => {
                        processor.input_receiver.set_test_input_date(aheui_input);
                    }
                    Err(_) => (),
                }

                processor.run_all_cycle();
                let result = processor.result_list;

                let aheui_out = match
                    fs::read_to_string(format!("{}/{}.out", _test_folder, test_name))
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
        let duration = execute_speed_test("add1ToN", true);
        assert!(duration.as_secs() < 2, "add1ToN 속도 테스트 실패")
    }

    #[test]
    fn factorization_speed_test() {
        let duration = execute_speed_test("factorization", true);
        assert!(duration.as_secs() < 10, "factorization 속도 테스트 실패")
    }
}
