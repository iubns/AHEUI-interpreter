#[cfg(test)]
mod lib_test {
    use aheui_interpreter::{create_processor_from_string};

    #[test]
    fn hello_world_test() {
        let test_word = "밤밣따빠밣밟따뿌\n빠맣파빨받밤뚜뭏\n돋밬탕빠맣붏두붇\n볻뫃박발뚷투뭏붖\n뫃도뫃희멓뭏뭏붘\n뫃봌토범더벌뿌뚜\n뽑뽀멓멓더벓뻐뚠\n뽀덩벐멓뻐덕더벅";
        let mut processor = create_processor_from_string(&test_word);
        processor.run_one_cycle(1);
        let result = processor.result_list;

        assert_eq!(result.join(""), "Hello, world!\n");
    }
}