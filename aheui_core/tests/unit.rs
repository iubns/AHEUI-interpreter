#[cfg(test)]
mod unit_test {
    use aheui_interpreter::storage::{ Storage };

    const TEST_VALUE_1: i64 = 10;
    const TEST_VALUE_2: i64 = 20;

    #[test]
    fn storage_push_test() {
        let mut storage = Storage::new();
        storage.push(TEST_VALUE_1);
    }

    #[test]
    fn storage_pop_test() {
        let mut storage = Storage::new();
        storage.push(TEST_VALUE_1);
        let value = storage.pop();

        match value {
            Some(v) => assert_eq!(v, TEST_VALUE_1),
            None => panic!(),
        }
    }

    #[test]
    fn storage_duplicate_test() {
        let mut storage = Storage::new();
        storage.push(TEST_VALUE_1);
        storage.duplicate();
        let value1 = storage.pop();
        let value2 = storage.pop();

        match value1 {
            Some(v) => assert_eq!(v, TEST_VALUE_1),
            None => panic!(),
        }

        assert_eq!(value1, value2);
    }

    #[test]
    fn storage_swap_test() {
        let mut storage = Storage::new();
        storage.push(TEST_VALUE_1);
        storage.push(TEST_VALUE_2);
        storage.swap();

        let first_value = storage.pop();
        let second_value = storage.pop();

        match first_value {
            Some(value) => assert_eq!(value, TEST_VALUE_1),
            None => panic!(),
        }

        match second_value {
            Some(value) => assert_eq!(value, TEST_VALUE_2),
            None => panic!(),
        }
    }
}
