/* tslint:disable */
/* eslint-disable */
export const memory: WebAssembly.Memory;
export function __wbg_way_free(a: number): void;
export function __wbg_processor_free(a: number): void;
export function __wbg_get_processor_current_position(a: number): number;
export function __wbg_set_processor_current_position(a: number, b: number): void;
export function __wbg_get_processor_next_position(a: number): number;
export function __wbg_set_processor_next_position(a: number, b: number): void;
export function __wbg_get_processor_cmd_size(a: number): number;
export function __wbg_set_processor_cmd_size(a: number, b: number): void;
export function __wbg_get_processor_is_end(a: number): number;
export function __wbg_set_processor_is_end(a: number, b: number): void;
export function __wbg_get_processor_cmd_processing_count(a: number): number;
export function __wbg_set_processor_cmd_processing_count(a: number, b: number): void;
export function processor_get_result(a: number, b: number): void;
export function processor_get_storage(a: number): number;
export function processor_new(): number;
export function processor_set_command(a: number, b: number, c: number): void;
export function processor_set_cmd_size(a: number, b: number): void;
export function processor_run_one_cycle(a: number, b: number): void;
export function processor_run_one(a: number): void;
export function __wbg_storage_free(a: number): void;
export function storage_new(): number;
export function storage_push(a: number, b: number): void;
export function storage_pop(a: number, b: number): void;
export function storage_duplicate(a: number): void;
export function storage_swap(a: number): void;
export function storage_select(a: number, b: number): void;
export function storage_move_value(a: number, b: number): number;
export function storage_equal(a: number): number;
export function storage_revert(a: number, b: number): void;
export function __wbg_cellvalue_free(a: number): void;
export function __wbg_get_cellvalue_position(a: number): number;
export function __wbg_set_cellvalue_position(a: number, b: number): void;
export function __wbg_get_cellvalue_value(a: number): number;
export function __wbg_set_cellvalue_value(a: number, b: number): void;
export function __wbg_position_free(a: number): void;
export function __wbg_get_position_x(a: number): number;
export function __wbg_set_position_x(a: number, b: number): void;
export function __wbg_get_position_y(a: number): number;
export function __wbg_set_position_y(a: number, b: number): void;
export function run_new(a: number, b: number, c: number, d: number): number;
export function get_cell_value(a: number, b: number): number;
export function __wbindgen_malloc(a: number, b: number): number;
export function __wbindgen_realloc(a: number, b: number, c: number, d: number): number;
export function __wbindgen_add_to_stack_pointer(a: number): number;
export function __wbindgen_free(a: number, b: number, c: number): void;
