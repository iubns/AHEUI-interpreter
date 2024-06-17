#[cfg(test)]
mod lib_test {
    use std::{ fs, path::Path };

    use aheui_interpreter::{ create_processor_from_string };

    fn execute_test(test_name: &str, has_input: bool) {
        let aheui_cmd = match fs::read_to_string(format!("./tests/example/{}.aheui", test_name)) {
            Ok(v) => v,
            Err(e) => {
                return;
            }
        };
        let aheui_out = match fs::read_to_string(format!("./tests/example/{}.out", test_name)) {
            Ok(v) => v,
            Err(e) => {
                return;
            }
        };
        let mut processor = create_processor_from_string(&aheui_cmd);
        processor.run_one_cycle(1);
        let result = processor.result_list;

        assert_eq!(aheui_out, result.join(""));
    }

    #[test]
    fn hello_world_test() {
        let test_word =
            "밤밣따빠밣밟따뿌\n빠맣파빨받밤뚜뭏\n돋밬탕빠맣붏두붇\n볻뫃박발뚷투뭏붖\n뫃도뫃희멓뭏뭏붘\n뫃봌토범더벌뿌뚜\n뽑뽀멓멓더벓뻐뚠\n뽀덩벐멓뻐덕더벅";
        let mut processor = create_processor_from_string(&test_word);
        processor.run_one_cycle(1);
        let result = processor.result_list;

        assert_eq!(result.join(""), "Hello, world!\n");
    }

    #[test]
    fn example_test() {
        let path = Path::new("./tests/example");
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries {
                let entry = match entry {
                    Ok(v) => v,
                    Err(e) => {
                        continue;
                    }
                };

                match entry.path().extension() {
                    None => {
                        continue;
                    }
                    Some(v) => {
                        if v != "aheui" {
                            continue;
                        }
                    }
                }

                let path = entry.path();
                let file_name = match (&path).file_stem() {
                    None => {
                        continue;
                    }
                    Some(v) => v,
                };

                let test_name = match file_name.to_str() {
                    Some(file_na) => file_na,
                    None => {
                        continue;
                    }
                };

                let aheui_cmd = match fs::read_to_string(&path) {
                    Ok(v) => v,
                    Err(e) => {
                        continue;
                    }
                };

                let mut processor = create_processor_from_string(&aheui_cmd);
                processor.run_one_cycle(1);
                let result = processor.result_list;

                let aheui_out = match fs::read_to_string(format!("{}.out", test_name)) {
                    Ok(v) => v,
                    Err(e) => {
                        continue;
                    }
                };

                println!("{} 테스트 실행", test_name);
                assert_eq!(aheui_out, result.join(""));
            }
        }
    }

    #[test]
    fn bottle_test() {
        execute_test("99bottles", false);
    }
}
