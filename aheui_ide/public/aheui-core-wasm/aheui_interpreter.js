let wasm;

const cachedTextDecoder = (typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-8', { ignoreBOM: true, fatal: true }) : { decode: () => { throw Error('TextDecoder not available') } } );

if (typeof TextDecoder !== 'undefined') { cachedTextDecoder.decode(); };

let cachedUint8Memory0 = null;

function getUint8Memory0() {
    if (cachedUint8Memory0 === null || cachedUint8Memory0.byteLength === 0) {
        cachedUint8Memory0 = new Uint8Array(wasm.memory.buffer);
    }
    return cachedUint8Memory0;
}

function getStringFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return cachedTextDecoder.decode(getUint8Memory0().subarray(ptr, ptr + len));
}

const heap = new Array(128).fill(undefined);

heap.push(undefined, null, true, false);

let heap_next = heap.length;

function addHeapObject(obj) {
    if (heap_next === heap.length) heap.push(heap.length + 1);
    const idx = heap_next;
    heap_next = heap[idx];

    heap[idx] = obj;
    return idx;
}

let WASM_VECTOR_LEN = 0;

const cachedTextEncoder = (typeof TextEncoder !== 'undefined' ? new TextEncoder('utf-8') : { encode: () => { throw Error('TextEncoder not available') } } );

const encodeString = (typeof cachedTextEncoder.encodeInto === 'function'
    ? function (arg, view) {
    return cachedTextEncoder.encodeInto(arg, view);
}
    : function (arg, view) {
    const buf = cachedTextEncoder.encode(arg);
    view.set(buf);
    return {
        read: arg.length,
        written: buf.length
    };
});

function passStringToWasm0(arg, malloc, realloc) {

    if (realloc === undefined) {
        const buf = cachedTextEncoder.encode(arg);
        const ptr = malloc(buf.length, 1) >>> 0;
        getUint8Memory0().subarray(ptr, ptr + buf.length).set(buf);
        WASM_VECTOR_LEN = buf.length;
        return ptr;
    }

    let len = arg.length;
    let ptr = malloc(len, 1) >>> 0;

    const mem = getUint8Memory0();

    let offset = 0;

    for (; offset < len; offset++) {
        const code = arg.charCodeAt(offset);
        if (code > 0x7F) break;
        mem[ptr + offset] = code;
    }

    if (offset !== len) {
        if (offset !== 0) {
            arg = arg.slice(offset);
        }
        ptr = realloc(ptr, len, len = offset + arg.length * 3, 1) >>> 0;
        const view = getUint8Memory0().subarray(ptr + offset, ptr + len);
        const ret = encodeString(arg, view);

        offset += ret.written;
        ptr = realloc(ptr, len, offset, 1) >>> 0;
    }

    WASM_VECTOR_LEN = offset;
    return ptr;
}

let cachedInt32Memory0 = null;

function getInt32Memory0() {
    if (cachedInt32Memory0 === null || cachedInt32Memory0.byteLength === 0) {
        cachedInt32Memory0 = new Int32Array(wasm.memory.buffer);
    }
    return cachedInt32Memory0;
}

function _assertClass(instance, klass) {
    if (!(instance instanceof klass)) {
        throw new Error(`expected instance of ${klass.name}`);
    }
    return instance.ptr;
}

let cachedUint32Memory0 = null;

function getUint32Memory0() {
    if (cachedUint32Memory0 === null || cachedUint32Memory0.byteLength === 0) {
        cachedUint32Memory0 = new Uint32Array(wasm.memory.buffer);
    }
    return cachedUint32Memory0;
}

function getObject(idx) { return heap[idx]; }

function dropObject(idx) {
    if (idx < 132) return;
    heap[idx] = heap_next;
    heap_next = idx;
}

function takeObject(idx) {
    const ret = getObject(idx);
    dropObject(idx);
    return ret;
}

function getArrayJsValueFromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    const mem = getUint32Memory0();
    const slice = mem.subarray(ptr / 4, ptr / 4 + len);
    const result = [];
    for (let i = 0; i < slice.length; i++) {
        result.push(takeObject(slice[i]));
    }
    return result;
}

let cachedBigInt64Memory0 = null;

function getBigInt64Memory0() {
    if (cachedBigInt64Memory0 === null || cachedBigInt64Memory0.byteLength === 0) {
        cachedBigInt64Memory0 = new BigInt64Array(wasm.memory.buffer);
    }
    return cachedBigInt64Memory0;
}

function getArrayI64FromWasm0(ptr, len) {
    ptr = ptr >>> 0;
    return getBigInt64Memory0().subarray(ptr / 8, ptr / 8 + len);
}

function passArrayJsValueToWasm0(array, malloc) {
    const ptr = malloc(array.length * 4, 4) >>> 0;
    const mem = getUint32Memory0();
    for (let i = 0; i < array.length; i++) {
        mem[ptr / 4 + i] = addHeapObject(array[i]);
    }
    WASM_VECTOR_LEN = array.length;
    return ptr;
}
/**
* @param {(CellValue)[]} cell_list
* @param {number} cmd_size_x
* @param {number} cmd_size_y
* @returns {Processor}
*/
export function run_new(cell_list, cmd_size_x, cmd_size_y) {
    const ptr0 = passArrayJsValueToWasm0(cell_list, wasm.__wbindgen_malloc);
    const len0 = WASM_VECTOR_LEN;
    const ret = wasm.run_new(ptr0, len0, cmd_size_x, cmd_size_y);
    return Processor.__wrap(ret);
}

/**
* @param {number} x
* @param {number} y
* @returns {CellValue}
*/
export function get_cell_value(x, y) {
    const ret = wasm.get_cell_value(x, y);
    return CellValue.__wrap(ret);
}

function _assertChar(c) {
    if (typeof(c) === 'number' && (c >= 0x110000 || (c >= 0xD800 && c < 0xE000))) throw new Error(`expected a valid Unicode scalar value, found ${c}`);
}

const CellValueFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_cellvalue_free(ptr >>> 0));
/**
*/
export class CellValue {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(CellValue.prototype);
        obj.__wbg_ptr = ptr;
        CellValueFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    static __unwrap(jsValue) {
        if (!(jsValue instanceof CellValue)) {
            return 0;
        }
        return jsValue.__destroy_into_raw();
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        CellValueFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_cellvalue_free(ptr);
    }
    /**
    * @returns {Position}
    */
    get position() {
        const ret = wasm.__wbg_get_cellvalue_position(this.__wbg_ptr);
        return Position.__wrap(ret);
    }
    /**
    * @param {Position} arg0
    */
    set position(arg0) {
        _assertClass(arg0, Position);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_cellvalue_position(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {string}
    */
    get value() {
        const ret = wasm.__wbg_get_cellvalue_value(this.__wbg_ptr);
        return String.fromCodePoint(ret);
    }
    /**
    * @param {string} arg0
    */
    set value(arg0) {
        const char0 = arg0.codePointAt(0);
        _assertChar(char0);
        wasm.__wbg_set_cellvalue_value(this.__wbg_ptr, char0);
    }
}

const PositionFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_position_free(ptr >>> 0));
/**
*/
export class Position {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Position.prototype);
        obj.__wbg_ptr = ptr;
        PositionFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        PositionFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_position_free(ptr);
    }
    /**
    * @returns {number}
    */
    get x() {
        const ret = wasm.__wbg_get_position_x(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set x(arg0) {
        wasm.__wbg_set_position_x(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {number}
    */
    get y() {
        const ret = wasm.__wbg_get_position_y(this.__wbg_ptr);
        return ret >>> 0;
    }
    /**
    * @param {number} arg0
    */
    set y(arg0) {
        wasm.__wbg_set_position_y(this.__wbg_ptr, arg0);
    }
}

const ProcessorFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_processor_free(ptr >>> 0));
/**
*/
export class Processor {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Processor.prototype);
        obj.__wbg_ptr = ptr;
        ProcessorFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        ProcessorFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_processor_free(ptr);
    }
    /**
    * @returns {Position}
    */
    get current_position() {
        const ret = wasm.__wbg_get_processor_current_position(this.__wbg_ptr);
        return Position.__wrap(ret);
    }
    /**
    * @param {Position} arg0
    */
    set current_position(arg0) {
        _assertClass(arg0, Position);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_processor_current_position(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {Position}
    */
    get next_position() {
        const ret = wasm.__wbg_get_processor_next_position(this.__wbg_ptr);
        return Position.__wrap(ret);
    }
    /**
    * @param {Position} arg0
    */
    set next_position(arg0) {
        _assertClass(arg0, Position);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_processor_next_position(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {Position}
    */
    get cmd_size() {
        const ret = wasm.__wbg_get_processor_cmd_size(this.__wbg_ptr);
        return Position.__wrap(ret);
    }
    /**
    * @param {Position} arg0
    */
    set cmd_size(arg0) {
        _assertClass(arg0, Position);
        var ptr0 = arg0.__destroy_into_raw();
        wasm.__wbg_set_processor_cmd_size(this.__wbg_ptr, ptr0);
    }
    /**
    * @returns {boolean}
    */
    get is_end() {
        const ret = wasm.__wbg_get_processor_is_end(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @param {boolean} arg0
    */
    set is_end(arg0) {
        wasm.__wbg_set_processor_is_end(this.__wbg_ptr, arg0);
    }
    /**
    * @returns {(string)[]}
    */
    get get_result() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.processor_get_result(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayJsValueFromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 4, 4);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {BigInt64Array}
    */
    get get_storage() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.processor_get_storage(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r1 = getInt32Memory0()[retptr / 4 + 1];
            var v1 = getArrayI64FromWasm0(r0, r1).slice();
            wasm.__wbindgen_free(r0, r1 * 8, 8);
            return v1;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    * @returns {Processor}
    */
    static new() {
        const ret = wasm.processor_new();
        return Processor.__wrap(ret);
    }
    /**
    * @param {(CellValue)[]} cell_list
    */
    set_command(cell_list) {
        const ptr0 = passArrayJsValueToWasm0(cell_list, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        wasm.processor_set_command(this.__wbg_ptr, ptr0, len0);
    }
    /**
    * @param {Position} cmd_size
    */
    set_cmd_size(cmd_size) {
        _assertClass(cmd_size, Position);
        var ptr0 = cmd_size.__destroy_into_raw();
        wasm.processor_set_cmd_size(this.__wbg_ptr, ptr0);
    }
    /**
    */
    run_one() {
        wasm.processor_run_one(this.__wbg_ptr);
    }
}

const StorageFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_storage_free(ptr >>> 0));
/**
*/
export class Storage {

    static __wrap(ptr) {
        ptr = ptr >>> 0;
        const obj = Object.create(Storage.prototype);
        obj.__wbg_ptr = ptr;
        StorageFinalization.register(obj, obj.__wbg_ptr, obj);
        return obj;
    }

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        StorageFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_storage_free(ptr);
    }
    /**
    * @returns {Storage}
    */
    static new() {
        const ret = wasm.storage_new();
        return Storage.__wrap(ret);
    }
    /**
    * @param {bigint} value
    */
    push(value) {
        wasm.storage_push(this.__wbg_ptr, value);
    }
    /**
    * @returns {bigint | undefined}
    */
    pop() {
        try {
            const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
            wasm.storage_pop(retptr, this.__wbg_ptr);
            var r0 = getInt32Memory0()[retptr / 4 + 0];
            var r2 = getBigInt64Memory0()[retptr / 8 + 1];
            return r0 === 0 ? undefined : r2;
        } finally {
            wasm.__wbindgen_add_to_stack_pointer(16);
        }
    }
    /**
    */
    duplicate() {
        wasm.storage_duplicate(this.__wbg_ptr);
    }
    /**
    */
    swap() {
        wasm.storage_swap(this.__wbg_ptr);
    }
    /**
    * @param {number} value
    */
    select(value) {
        wasm.storage_select(this.__wbg_ptr, value);
    }
    /**
    * @param {number} value
    * @returns {boolean}
    */
    move_value(value) {
        const ret = wasm.storage_move_value(this.__wbg_ptr, value);
        return ret !== 0;
    }
    /**
    * @returns {boolean}
    */
    equal() {
        const ret = wasm.storage_equal(this.__wbg_ptr);
        return ret !== 0;
    }
    /**
    * @param {bigint} value
    */
    revert(value) {
        wasm.storage_revert(this.__wbg_ptr, value);
    }
}

const WayFinalization = (typeof FinalizationRegistry === 'undefined')
    ? { register: () => {}, unregister: () => {} }
    : new FinalizationRegistry(ptr => wasm.__wbg_way_free(ptr >>> 0));
/**
*/
export class Way {

    __destroy_into_raw() {
        const ptr = this.__wbg_ptr;
        this.__wbg_ptr = 0;
        WayFinalization.unregister(this);
        return ptr;
    }

    free() {
        const ptr = this.__destroy_into_raw();
        wasm.__wbg_way_free(ptr);
    }
}

async function __wbg_load(module, imports) {
    if (typeof Response === 'function' && module instanceof Response) {
        if (typeof WebAssembly.instantiateStreaming === 'function') {
            try {
                return await WebAssembly.instantiateStreaming(module, imports);

            } catch (e) {
                if (module.headers.get('Content-Type') != 'application/wasm') {
                    console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n", e);

                } else {
                    throw e;
                }
            }
        }

        const bytes = await module.arrayBuffer();
        return await WebAssembly.instantiate(bytes, imports);

    } else {
        const instance = await WebAssembly.instantiate(module, imports);

        if (instance instanceof WebAssembly.Instance) {
            return { instance, module };

        } else {
            return instance;
        }
    }
}

function __wbg_get_imports() {
    const imports = {};
    imports.wbg = {};
    imports.wbg.__wbg_prompt_c19ebc571ffcd89b = function(arg0, arg1, arg2) {
        const ret = prompt(getStringFromWasm0(arg1, arg2));
        const ptr1 = passStringToWasm0(ret, wasm.__wbindgen_malloc, wasm.__wbindgen_realloc);
        const len1 = WASM_VECTOR_LEN;
        getInt32Memory0()[arg0 / 4 + 1] = len1;
        getInt32Memory0()[arg0 / 4 + 0] = ptr1;
    };
    imports.wbg.__wbg_cellvalue_unwrap = function(arg0) {
        const ret = CellValue.__unwrap(takeObject(arg0));
        return ret;
    };
    imports.wbg.__wbindgen_string_new = function(arg0, arg1) {
        const ret = getStringFromWasm0(arg0, arg1);
        return addHeapObject(ret);
    };
    imports.wbg.__wbindgen_throw = function(arg0, arg1) {
        throw new Error(getStringFromWasm0(arg0, arg1));
    };

    return imports;
}

function __wbg_init_memory(imports, maybe_memory) {

}

function __wbg_finalize_init(instance, module) {
    wasm = instance.exports;
    __wbg_init.__wbindgen_wasm_module = module;
    cachedBigInt64Memory0 = null;
    cachedInt32Memory0 = null;
    cachedUint32Memory0 = null;
    cachedUint8Memory0 = null;


    return wasm;
}

function initSync(module) {
    if (wasm !== undefined) return wasm;

    const imports = __wbg_get_imports();

    __wbg_init_memory(imports);

    if (!(module instanceof WebAssembly.Module)) {
        module = new WebAssembly.Module(module);
    }

    const instance = new WebAssembly.Instance(module, imports);

    return __wbg_finalize_init(instance, module);
}

async function __wbg_init(input) {
    if (wasm !== undefined) return wasm;

    if (typeof input === 'undefined') {
        input = new URL('aheui_interpreter_bg.wasm', import.meta.url);
    }
    const imports = __wbg_get_imports();

    if (typeof input === 'string' || (typeof Request === 'function' && input instanceof Request) || (typeof URL === 'function' && input instanceof URL)) {
        input = fetch(input);
    }

    __wbg_init_memory(imports);

    const { instance, module } = await __wbg_load(await input, imports);

    return __wbg_finalize_init(instance, module);
}

export { initSync }
export default __wbg_init;
