/* tslint:disable */
/* eslint-disable */
/**
* @param {(CellValue)[]} cell_list
* @param {number} cmd_size_x
* @param {number} cmd_size_y
* @returns {Processor}
*/
export function run_new(cell_list: (CellValue)[], cmd_size_x: number, cmd_size_y: number): Processor;
/**
* @param {number} x
* @param {number} y
* @returns {CellValue}
*/
export function get_cell_value(x: number, y: number): CellValue;
/**
*/
export class CellValue {
  free(): void;
/**
*/
  position: Position;
/**
*/
  value: string;
}
/**
*/
export class Position {
  free(): void;
/**
*/
  x: number;
/**
*/
  y: number;
}
/**
*/
export class Processor {
  free(): void;
/**
* @returns {Processor}
*/
  static new(): Processor;
/**
* @param {(CellValue)[]} cell_list
*/
  set_command(cell_list: (CellValue)[]): void;
/**
* @param {Position} cmd_size
*/
  set_cmd_size(cmd_size: Position): void;
/**
* @param {number} cycle_count
*/
  run_one_cycle(cycle_count: number): void;
/**
*/
  run_one(): void;
/**
*/
  cmd_processing_count: bigint;
/**
*/
  cmd_size: Position;
/**
*/
  current_position: Position;
/**
*/
  readonly get_result: (string)[];
/**
*/
  readonly get_storage: BigInt64Array;
/**
*/
  is_end: boolean;
/**
*/
  next_position: Position;
}
/**
*/
export class Storage {
  free(): void;
/**
* @returns {Storage}
*/
  static new(): Storage;
/**
* @param {bigint} value
*/
  push(value: bigint): void;
/**
* @returns {bigint | undefined}
*/
  pop(): bigint | undefined;
/**
*/
  duplicate(): void;
/**
*/
  swap(): void;
/**
* @param {number} value
*/
  select(value: number): void;
/**
* @param {number} value
* @returns {boolean}
*/
  move_value(value: number): boolean;
/**
* @returns {boolean}
*/
  equal(): boolean;
/**
* @param {bigint} value
*/
  revert(value: bigint): void;
}
/**
*/
export class Way {
  free(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_way_free: (a: number) => void;
  readonly __wbg_processor_free: (a: number) => void;
  readonly __wbg_get_processor_current_position: (a: number) => number;
  readonly __wbg_set_processor_current_position: (a: number, b: number) => void;
  readonly __wbg_get_processor_next_position: (a: number) => number;
  readonly __wbg_set_processor_next_position: (a: number, b: number) => void;
  readonly __wbg_get_processor_cmd_size: (a: number) => number;
  readonly __wbg_set_processor_cmd_size: (a: number, b: number) => void;
  readonly __wbg_get_processor_is_end: (a: number) => number;
  readonly __wbg_set_processor_is_end: (a: number, b: number) => void;
  readonly __wbg_get_processor_cmd_processing_count: (a: number) => number;
  readonly __wbg_set_processor_cmd_processing_count: (a: number, b: number) => void;
  readonly processor_get_result: (a: number, b: number) => void;
  readonly processor_get_storage: (a: number, b: number) => void;
  readonly processor_new: () => number;
  readonly processor_set_command: (a: number, b: number, c: number) => void;
  readonly processor_set_cmd_size: (a: number, b: number) => void;
  readonly processor_run_one_cycle: (a: number, b: number) => void;
  readonly processor_run_one: (a: number) => void;
  readonly run_new: (a: number, b: number, c: number, d: number) => number;
  readonly get_cell_value: (a: number, b: number) => number;
  readonly __wbg_storage_free: (a: number) => void;
  readonly storage_new: () => number;
  readonly storage_push: (a: number, b: number) => void;
  readonly storage_pop: (a: number, b: number) => void;
  readonly storage_duplicate: (a: number) => void;
  readonly storage_swap: (a: number) => void;
  readonly storage_select: (a: number, b: number) => void;
  readonly storage_move_value: (a: number, b: number) => number;
  readonly storage_equal: (a: number) => number;
  readonly storage_revert: (a: number, b: number) => void;
  readonly __wbg_cellvalue_free: (a: number) => void;
  readonly __wbg_get_cellvalue_position: (a: number) => number;
  readonly __wbg_set_cellvalue_position: (a: number, b: number) => void;
  readonly __wbg_get_cellvalue_value: (a: number) => number;
  readonly __wbg_set_cellvalue_value: (a: number, b: number) => void;
  readonly __wbg_position_free: (a: number) => void;
  readonly __wbg_get_position_x: (a: number) => number;
  readonly __wbg_set_position_x: (a: number, b: number) => void;
  readonly __wbg_get_position_y: (a: number) => number;
  readonly __wbg_set_position_y: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_add_to_stack_pointer: (a: number) => number;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {SyncInitInput} module
*
* @returns {InitOutput}
*/
export function initSync(module: SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {InitInput | Promise<InitInput>} module_or_path
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: InitInput | Promise<InitInput>): Promise<InitOutput>;
