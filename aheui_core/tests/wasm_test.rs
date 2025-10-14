#[cfg(test)]
mod wasm_test {
    use std::{fs, path::Path};
    use aheui_interpreter::create_processor_from_string;
    use wasmtime::{Engine, Module, Store, Instance, Extern};

    static TEST_LIST: [&str; 2] = [
        "exitcode",
        "tieut",
    ];

    #[test]
    fn sample_test_for_wasm(){
        for test_name in TEST_LIST.iter() {
            let _test_folder = "./tests/auto_test_cases";
            let path = Path::new(_test_folder).join(format!("{}.aheui", test_name));
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

            let parsed = processor.compile_to_wasm();
            assert!(parsed.success(), "WASM 컴파일 실패: {} - {}", test_name, parsed.error().unwrap_or("unknown error".to_string()));
            let wasm_binary = parsed.binary().unwrap();
            let result = run_wasm(&wasm_binary);

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

    #[test]
    fn auto_all_test_for_wasm(){
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

                let parsed = processor.compile_to_wasm();
                assert!(parsed.success(), "WASM 컴파일 실패: {} - {}", test_name, parsed.error().unwrap_or("unknown error".to_string()));
                let wasm_binary = parsed.binary().unwrap();
                let result = run_wasm(&wasm_binary);

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
    
    pub fn run_wasm(wasm_binary: &[u8]) -> Vec<String> {
        let binary = wasm_binary;
        let engine = Engine::default();
        let module = wasmtime::Module::from_binary(&engine, &binary).expect("module compile");
        let mut store = wasmtime::Store::new(&engine, ());
        let instance = wasmtime::Instance::new(&mut store, &module, &[]).expect("instantiate");
        // export된 함수 찾기 (위 WAT 예제에서 export 이름은 "add")
        let run_one = instance.get_func(&mut store, "runOne").expect("export runOne");
        let run_one_typed = run_one.typed::<(), i32>(&store).expect("typed func");
        let result = run_one_typed.call(&mut store, ()).expect("call runOne");
        println!("run result from wasm: {}", result);
        [result.to_string()].to_vec()
    }
}