use wasm_bindgen::prelude::*;

pub struct InputReceiver {
    is_test: bool,
    test_input_data: Vec<String>,
    current_cursor: usize,
}

#[wasm_bindgen]
extern "C" {
    fn getInputData(a: &str) -> String;
}

impl InputReceiver {
    pub fn new() -> InputReceiver {
        InputReceiver {
            is_test: false,
            test_input_data: Vec::new(),
            current_cursor: 0,
        }
    }

    pub fn get_next_data(&mut self, a: &str) -> String {
        if !self.is_test {
            return getInputData(a);
        }
        let value = match self.test_input_data.get(self.current_cursor) {
            Some(v) => v,
            None => panic!(),
        };
        self.current_cursor += 1;
        return value.clone();
    }

    pub fn set_test_input_date(&mut self, content: String) {
        self.is_test = true;
        let rows = content.split("\n");
        for (_, row) in rows.enumerate() {
            let values = row.split(' ');
            for (_, value) in values.enumerate() {
                self.test_input_data.push(value.to_string());
            }
        }
    }
}
